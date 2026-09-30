#!/usr/bin/env python3
import sys
import os
import json
import re
import urllib.request
import html

def clean_text(raw):
    if not raw:
        return ""
    # Unescape HTML entities first so we don't double escape later
    text = html.unescape(raw)
    # Strip HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text

def escape_xml(text):
    if not text:
        return ""
    # text is unescaped plain string, escape strictly for XML
    return (text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace('"', "&quot;")
                .replace("'", "&apos;"))

def fetch_html(source_path_or_url):
    if source_path_or_url.startswith("http://") or source_path_or_url.startswith("https://"):
        url = source_path_or_url
        req = urllib.request.Request(url, headers={"User-Agent": "Python"})
        with urllib.request.urlopen(req) as resp:
            return resp.read().decode("utf-8", errors="ignore"), url
    elif os.path.exists(source_path_or_url):
        with open(source_path_or_url, "r", encoding="utf-8") as f:
            return f.read(), source_path_or_url
    else:
        clean_path = source_path_or_url.lstrip("/")
        url = f"https://raw.githubusercontent.com/cosylanguages/COSYevents/main/{clean_path}"
        req = urllib.request.Request(url, headers={"User-Agent": "Python"})
        with urllib.request.urlopen(req) as resp:
            return resp.read().decode("utf-8", errors="ignore"), url

def extract_section(raw_html, section_id, next_ids=[]):
    pattern = f'id="{section_id}"'
    start_pos = raw_html.find(pattern)
    if start_pos == -1:
        return ""

    end_pos = len(raw_html)
    for nid in next_ids:
        np = raw_html.find(f'id="{nid}"', start_pos)
        if np != -1 and np < end_pos:
            end_pos = np

    return raw_html[start_pos:end_pos]

def parse_session_html(raw_html, url):
    # Extract Title
    h1_m = re.search(r"<h1[^>]*>(.*?)</h1>", raw_html, re.DOTALL)
    if h1_m:
        title = clean_text(h1_m.group(1))
    else:
        title = "Session Lesson"

    # Language
    if "/fr/" in url or 'lang="fr"' in raw_html or "Langues</h4><p>🇫🇷" in raw_html:
        lang = "fr"
    elif "/ru/" in url or 'lang="ru"' in raw_html or "Langues</h4><p>🇷🇺" in raw_html:
        lang = "ru"
    else:
        lang = "en"

    # Level
    filename = url.split("/")[-1].replace(".html", "")
    level = "B1"
    level_rules = [
        (r"-(starter|a0)$", "A0"),
        (r"-(elementary|a1)$", "A1"),
        (r"-(pre-intermediate|a2)$", "A2"),
        (r"-(intermediate|b1)$", "B1"),
        (r"-(upper-intermediate|b2)$", "B2"),
        (r"-(advanced|c1)$", "C1"),
        (r"-(proficiency|c2)$", "C2")
    ]
    for pat, lstr in level_rules:
        if re.search(pat, filename, re.IGNORECASE):
            level = lstr
            break

    if level == "B1":
        meta_matches = re.findall(r'<div class="meta-item"[^>]*>(.*?)</div>', raw_html, re.DOTALL)
        for m in meta_matches:
            cm = clean_text(m)
            if re.search(r"\b(starter|a0)\b", cm, re.I): level = "A0"; break
            elif re.search(r"\b(elementary|a1)\b", cm, re.I): level = "A1"; break
            elif re.search(r"\b(pre-intermediate|a2)\b", cm, re.I): level = "A2"; break
            elif re.search(r"\b(upper-intermediate|b2)\b", cm, re.I): level = "B2"; break
            elif re.search(r"\b(intermediate|b1)\b", cm, re.I): level = "B1"; break
            elif re.search(r"\b(advanced|c1)\b", cm, re.I): level = "C1"; break
            elif re.search(r"\b(proficiency|c2)\b", cm, re.I): level = "C2"; break

    # Extract Vocabulary Cards
    vocab_items = []
    # Match individual vocab-word/vocab-def/vocab-example pairs
    card_matches = re.findall(
        r'<div class="vocab-word"[^>]*>(.*?)</div>\s*<div class="vocab-def"[^>]*>(.*?)</div>(?:\s*<div class="vocab-example"[^>]*>(.*?)</div>)?',
        raw_html,
        re.DOTALL
    )
    for w, d, e in card_matches:
        w_txt = clean_text(w)
        d_txt = clean_text(d)
        e_txt = clean_text(e) if e else ""
        if w_txt and (d_txt or e_txt):
            vocab_items.append({"word": w_txt, "def": d_txt, "example": e_txt})

    # Look for vim-choice-item if vocab-cards were empty
    if not vocab_items:
        vc_blocks = re.findall(r'<div[^>]*class="[^"]*vim-choice-item[^"]*"[^>]*>(.*?)</div>', raw_html, re.DOTALL)
        for vc in vc_blocks:
            term_m = re.search(r'class="vc-term"[^>]*>(.*?)</span>', vc, re.DOTALL) or re.search(r'<strong>(.*?)</strong>', vc, re.DOTALL)
            def_m = re.search(r'class="vc-def"[^>]*>(.*?)</span>', vc, re.DOTALL)
            ex_m = re.search(r'class="vc-example"[^>]*>(.*?)</p>', vc, re.DOTALL)
            if term_m:
                term = clean_text(term_m.group(1))
                definition = clean_text(def_m.group(1)) if def_m else ""
                example = clean_text(ex_m.group(1)) if ex_m else ""
                if term and (definition or example):
                    vocab_items.append({"word": term, "def": definition, "example": example})

    # Fallback list items
    if not vocab_items:
        raw_vocab = re.findall(r'<li>\s*<strong>(.*?)</strong>\s*[:–-]?\s*(.*?)(?:<em>(.*?)</em>)?\s*</li>', raw_html, re.DOTALL)
        for term, definition, example in raw_vocab:
            clean_term = clean_text(term)
            clean_def = clean_text(definition)
            clean_ex = clean_text(example) if example else ""
            if clean_term and (clean_def or clean_ex):
                vocab_items.append({"word": clean_term, "def": clean_def, "example": clean_ex})

    r1_html = extract_section(raw_html, "s-r1", ["s-lst", "s-r2", "s-mistakes"])
    lst_html = extract_section(raw_html, "s-lst", ["s-r2", "s-mistakes"])
    r2_html = extract_section(raw_html, "s-r2", ["s-mistakes"])
    mistakes_html = extract_section(raw_html, "s-mistakes", [])

    return {
        "url": url,
        "title": title,
        "lang": lang,
        "level": level,
        "filename": filename,
        "vocab_items": vocab_items,
        "r1_html": r1_html,
        "lst_html": lst_html,
        "r2_html": r2_html,
        "mistakes_html": mistakes_html,
        "full_html": raw_html
    }

def extract_round_items(round_html):
    if not round_html:
        return [], "standard_items"

    sides = re.findall(r'<div[^>]*class="[^"]*(?:debate-side|debate-duel-item)[^"]*"[^>]*>(.*?)</div>', round_html, re.DOTALL)
    if sides:
        side_items = []
        for s in sides:
            side_title_m = re.search(r'<strong>(.*?)</strong>', s)
            side_title = clean_text(side_title_m.group(1)) if side_title_m else "Perspective"
            text = clean_text(s)
            side_items.append({"title": side_title, "text": text})
        return side_items, "debate_sides"

    splits = round_html.split('<div class="round-item">')
    raw_items = splits[1:] if len(splits) > 1 else []

    parsed_items = []
    for ri in raw_items:
        if '</div>\n      </div>' in ri:
            ri = ri.split('</div>\n      </div>')[0]

        main_m = re.search(r'class="round-item-main"[^>]*>(.*?)</div>', ri, re.DOTALL)
        pers_m = re.search(r'class="round-item-personal"[^>]*>(.*?)</div>', ri, re.DOTALL)
        if main_m:
            main_txt = clean_text(main_m.group(1))
            pers_txt = clean_text(pers_m.group(1)) if pers_m else ""
            parsed_items.append({"main": main_txt, "personal": pers_txt})
        else:
            clean_txt = clean_text(ri)
            if "round-header" in clean_txt:
                clean_txt = clean_txt.split("round-header")[0].strip()
            if clean_txt:
                parsed_items.append({"main": clean_txt, "personal": ""})

    return parsed_items, "standard_items"

def adapt_roleplay_text(text, lang="en"):
    """Generalized roleplay and partner adaptation for 1-on-1 mode."""
    if not text:
        return ""

    # 1. Transform 'One of you plays A, and the other plays B.'
    pattern_pair = r"One of you plays (.*?), and the other plays (.*?)(?:\.|$)"
    def replace_pair(m):
        role_a = m.group(1).strip()
        role_b = m.group(2).strip()
        return f"Your teacher will play {role_a}; you play {role_b}."

    text = re.sub(pattern_pair, replace_pair, text, flags=re.IGNORECASE)

    # 2. General phrase replacements across languages
    text = text.replace("Work with your partner", "Work with your teacher")
    text = text.replace("work with your partner", "work with your teacher")
    text = text.replace("In pairs", "With your teacher")
    text = text.replace("in pairs", "with your teacher")
    text = text.replace("Discuss with your partner", "Discuss with your teacher")
    text = text.replace("discuss with your partner", "discuss with your teacher")

    # French replacements
    text = text.replace("En binôme", "Avec votre professeur")
    text = text.replace("en binôme", "avec votre professeur")
    text = text.replace("Discutez avec votre partenaire", "Discutez avec votre professeur")
    text = text.replace("L'un de vous joue", "Votre professeur jouera")

    # Russian replacements
    text = text.replace("В парах", "С преподавателем")
    text = text.replace("в парах", "с преподавателем")
    text = text.replace("Обсудите с партнером", "Обсудите с преподавателем")
    text = text.replace("Один из вас играет", "Преподаватель сыграет")

    return text

def extract_lst_content(lst_html, lang="en"):
    if not lst_html:
        return "Collaborative task or visual study.", "Collaborative task or visual study.", []

    body_m = re.search(r'<div class="round-body"[^>]*>(.*)', lst_html, re.DOTALL)
    raw_body = body_m.group(1) if body_m else lst_html

    # Clean out trailing blocks
    if '<div class="round-block' in raw_body:
        raw_body = raw_body.split('<div class="round-block')[0]
    if '<div class="mistake-block' in raw_body:
        raw_body = raw_body.split('<div class="mistake-block')[0]

    # Look for images inside LST block
    img_urls = re.findall(r'<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"', raw_body, re.I)
    if not img_urls:
        img_urls_src = re.findall(r'<img[^>]*src="([^"]+)"', raw_body, re.I)
        img_urls = [(src, "Visual prompt") for src in img_urls_src]

    # Look for grid items
    grid_items = re.findall(r'<div class="lst-item"[^>]*>(.*?)</div>\s*</div>', raw_body, re.DOTALL)
    if not grid_items:
        grid_items = re.findall(r'<div class="lst-item"[^>]*>(.*?)</div>', raw_body, re.DOTALL)

    if grid_items:
        items_txt = []
        for gi in grid_items:
            clean_gi = clean_text(gi)
            items_txt.append(clean_gi)

        note_m = re.search(r'class="round-note"[^>]*>(.*?)</p>', raw_body, re.DOTALL)
        note_txt = clean_text(note_m.group(1)) if note_m else ""

        group_text = note_txt + "\n" + "\n".join([f"- {it}" for it in items_txt]) if note_txt else "\n".join([f"- {it}" for it in items_txt])
        ind_text = adapt_roleplay_text(group_text, lang)
        return group_text.strip(), ind_text.strip(), img_urls

    clean_body_text = clean_text(raw_body)
    group_text = clean_body_text
    ind_text = adapt_roleplay_text(clean_body_text, lang)

    return group_text, ind_text, img_urls

def generate_lesson_xml(parsed_data, lesson_id=None, is_discussion_format=True):
    if not lesson_id:
        lesson_id = parsed_data["filename"]

    lang = parsed_data["lang"]

    if lang == "fr":
        vocab_intro = "Révisez le vocabulaire clé extrait pour cette session ci-dessous :"
        r1_intro = "Examinez l'extrait de lecture/écoute et discutez des questions générales :"
        comparison_intro = "Comparez la situation : avant vs maintenant, avec vs sans, et évaluez les changements :"
        debate_intro = "Débattez de ces affirmations. Exprimez votre accord ou désaccord et argumentez :"
        solutions_intro = "Formulez des solutions pratiques, des conseils et des recommandations :"
        future_intro = "Spéculez sur les évolutions futures et les tendances à long terme :"
        case_study_intro = "Étude de cas approfondie : analysez ce scénario complexe et proposez une décision :"
        workshop_intro = "Atelier de groupe (Cours collectif - 120 min) : collaborez en sous-groupe et présentez votre synthèse :"
        error_note_title = "Notes de correction linguistique du professeur"
    elif lang == "ru":
        vocab_intro = "Изучите ключевую лексику занятия:"
        r1_intro = "Ознакомьтесь с материалом и ответьте на общие вопросы для обсуждения:"
        comparison_intro = "Сравните ситуации: как было раньше и как сейчас, с данным явлением и без него:"
        debate_intro = "Проведите дискуссию по следующим утверждениям. Выразите согласие или несогласие:"
        solutions_intro = "Предложите практические решения и рекомендации для решения проблемы:"
        future_intro = "Сделайте прогнозы относительно будущих изменений и тенденций:"
        case_study_intro = "Глубокий разбор кейса: проанализируйте сценарий и предложите стратегическое решение:"
        workshop_intro = "Групповой практикум (Групповой формат - 120 мин): работа в парах и итоговая презентация:"
        error_note_title = "Заметки преподавателя по языковым ошибкам"
    else:
        vocab_intro = "Review key target vocabulary extracted for this session below:"
        r1_intro = "Read/listen to the prompt and discuss the general topic questions:"
        comparison_intro = "Compare the scenario: how it was before vs. now, or life with vs. without it:"
        debate_intro = "Debate these statements. State whether you agree or disagree and justify your position:"
        solutions_intro = "Propose practical solutions, actionable advice, and policy recommendations:"
        future_intro = "Speculate on future developments and long-term trends:"
        case_study_intro = "Extended Case Study (90m / 120m format): Analyze this complex real-world scenario:"
        workshop_intro = "Group Workshop & Synthesis Presentation (120m Group Format Only): Collaborate and present:"
        error_note_title = "Teacher's Linguistic Error Correction Guidance"

    xml_lines = []
    xml_lines.append(f'<!-- source: {parsed_data["url"]} -->')
    xml_lines.append(f'<cosy-lesson id="{escape_xml(lesson_id)}" level="{escape_xml(parsed_data["level"])}" language="{escape_xml(lang)}" title="{escape_xml(parsed_data["title"])}" default-duration="50" default-mode="all">')

    # SLIDE 1: Warm-up & Target Vocabulary (All durations: 15, 30, 50, 80, 110)
    xml_lines.append('  <!-- SLIDE 1: Warm-up & Target Vocabulary (15m, 30m, 50m, 80m, 110m) -->')
    xml_lines.append('  <cosy-slide id="slide-1" stage="warm-up" duration="15" mode="all">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> activate prior knowledge and introduce key target vocabulary in context.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append('    <cosy-teacher-notes type="speech">')
    xml_lines.append('      <p><strong>Concept Check Questions (CCQs):</strong> Elicit meaning and drill pronunciation before starting speaking tasks.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-instruction>{escape_xml(vocab_intro)}</cosy-instruction>')

    if parsed_data["vocab_items"]:
        xml_lines.append('    <cosy-vocabulary>')
        for item in parsed_data["vocab_items"]:
            w = item["word"]
            d = item["def"]
            xml_lines.append(f'      <cosy-vocabulary-item word="{escape_xml(w)}" definition="{escape_xml(d)}" />')
        xml_lines.append('    </cosy-vocabulary>')

        for item in parsed_data["vocab_items"][:4]:
            w = item["word"]
            d = item["def"]
            ex = item["example"]
            xml_lines.append('    <cosy-blockquote importance="basic">')
            if d:
                xml_lines.append(f'      <p><cosy-text type="strong">{escape_xml(w)}</cosy-text> – {escape_xml(d)}</p>')
            else:
                xml_lines.append(f'      <p><cosy-text type="strong">{escape_xml(w)}</cosy-text></p>')
            if ex:
                xml_lines.append(f'      <p><em>Example: {escape_xml(ex)}</em></p>')
            xml_lines.append('    </cosy-blockquote>')
    else:
        xml_lines.append('    <cosy-blockquote importance="basic">')
        xml_lines.append(f'      <p>Welcome to <strong>{escape_xml(parsed_data["title"])}</strong>! Explore key concepts and activate target vocabulary.</p>')
        xml_lines.append('    </cosy-blockquote>')
    xml_lines.append('  </cosy-slide>')

    # SLIDE 2: Express Debate Blitz (15m Spoken Express format)
    xml_lines.append('\n  <!-- SLIDE 2: Express Debate Blitz (15m Spoken Format) -->')
    xml_lines.append('  <cosy-slide id="slide-15m-blitz" stage="warm-up" duration="15" mode="all">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> rapid 15-minute speaking blitz focused on immediate fluency and target vocabulary usage.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-instruction>15-Min Express Blitz: Share your core opinion on <strong>{escape_xml(parsed_data["title"])}</strong> in 90 seconds:</cosy-instruction>')
    xml_lines.append('    <cosy-record time="90" counts="3" />')
    xml_lines.append('  </cosy-slide>')

    # SLIDE 3: Reading / Listening & General Discussion (30m, 50m, 80m, 110m)
    r1_items, r1_type = extract_round_items(parsed_data["r1_html"])
    xml_lines.append('\n  <!-- SLIDE 3: Reading / Listening & General Discussion (30m+) -->')
    xml_lines.append('  <cosy-slide id="slide-2" stage="lead-in" duration="30" mode="all">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> engage with input reading/listening prompt and launch general topic discussion.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-instruction>{escape_xml(r1_intro)}</cosy-instruction>')
    xml_lines.append('    <ol>')
    for item in r1_items[:4] if r1_items else [{"main": f"What are your initial thoughts on {parsed_data['title']}?", "personal": ""}]:
        main_t = item.get("main", "") if isinstance(item, dict) else str(item)
        pers_t = item.get("personal", "") if isinstance(item, dict) else ""
        if pers_t:
            xml_lines.append(f'      <li>{escape_xml(main_t)}<br/><em>{escape_xml(pers_t)}</em></li>')
        else:
            xml_lines.append(f'      <li>{escape_xml(main_t)}</li>')
    xml_lines.append('    </ol>')
    xml_lines.append('  </cosy-slide>')

    # SLIDE 4: Comparison (Past vs Present / With vs Without) (50m+)
    lst_group_txt, lst_ind_txt, lst_imgs = extract_lst_content(parsed_data["lst_html"], lang)
    xml_lines.append('\n  <!-- SLIDE 4: Comparison (Past vs Present / With vs Without) (50m+) -->')
    xml_lines.append('  <cosy-slide id="slide-3" stage="freer-practice" duration="50" mode="all">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> practice comparative analysis and contrasting structures (used to, whereas, compared to).</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-instruction>{escape_xml(comparison_intro)}</cosy-instruction>')
    if lst_imgs:
        xml_lines.append('    <cosy-choice-image>')
        for img_src, img_alt in lst_imgs:
            xml_lines.append(f'      <cosy-choice-image-option resource-id="{escape_xml(img_src)}"><p>{escape_xml(img_alt)}</p></cosy-choice-image-option>')
        xml_lines.append('    </cosy-choice-image>')
    xml_lines.append('    <cosy-blockquote importance="medium">')
    xml_lines.append(f'      <p>{escape_xml(lst_group_txt)}</p>')
    xml_lines.append('    </cosy-blockquote>')
    xml_lines.append('  </cosy-slide>')

    # SLIDE 5: Debate / Agree or Disagree (30m, 50m, 80m, 110m)
    r2_items, r2_type = extract_round_items(parsed_data["r2_html"])
    xml_lines.append('\n  <!-- SLIDE 5: Debate / Agree or Disagree (30m+) -->')
    xml_lines.append('  <cosy-slide id="slide-4" stage="freer-practice" duration="30" mode="all">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> develop stance-taking, opinion justification, and counter-argumentation skills.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-instruction>{escape_xml(debate_intro)}</cosy-instruction>')
    xml_lines.append('    <ol>')
    for item in r2_items[:4] if r2_items else [{"main": "Agree or disagree: Technology fundamentally improves quality of life.", "personal": ""}]:
        main_t = item.get("main", "") if isinstance(item, dict) else str(item)
        pers_t = item.get("personal", "") if isinstance(item, dict) else ""
        if pers_t:
            xml_lines.append(f'      <li>{escape_xml(main_t)}<br/><em>{escape_xml(pers_t)}</em></li>')
        else:
            xml_lines.append(f'      <li>{escape_xml(main_t)}</li>')
    xml_lines.append('    </ol>')
    xml_lines.append('  </cosy-slide>')

    # SLIDE 6: Practical Solutions & Advice (50m, 80m, 110m)
    xml_lines.append('\n  <!-- SLIDE 6: Practical Solutions & Advice (50m+) -->')
    xml_lines.append('  <cosy-slide id="slide-5" stage="freer-practice" duration="50" mode="all">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> collaborative problem solving using modal verbs of recommendation (should, ought to, could).</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-instruction>{escape_xml(solutions_intro)}</cosy-instruction>')
    xml_lines.append('    <ol>')
    xml_lines.append(f'      <li>What are 3 practical steps individuals or organizations should take to address the core challenges of <strong>{escape_xml(parsed_data["title"])}</strong>?</li>')
    xml_lines.append('      <li>What advice would you give to someone experiencing this situation for the first time?</li>')
    xml_lines.append('    </ol>')
    xml_lines.append('  </cosy-slide>')

    # SLIDE 7: Future Speculation (50m, 80m, 110m)
    xml_lines.append('\n  <!-- SLIDE 7: Future Speculation (50m+) -->')
    xml_lines.append('  <cosy-slide id="slide-6" stage="freer-practice" duration="50" mode="all">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> express future probability and predict long-term developments (is bound to, will likely, is expected to).</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-instruction>{escape_xml(future_intro)}</cosy-instruction>')
    xml_lines.append('    <ol>')
    xml_lines.append(f'      <li>How do you expect <strong>{escape_xml(parsed_data["title"])}</strong> to evolve over the next 10 to 20 years?</li>')
    xml_lines.append('      <li>What unexpected technological or societal changes might reshape this field in the future?</li>')
    xml_lines.append('    </ol>')
    xml_lines.append('  </cosy-slide>')

    # SLIDE 8: Extended Case Study & Deep Analysis (80m, 110m - 90-min & 120-min formats)
    xml_lines.append('\n  <!-- SLIDE 8: Extended Case Study & Deep Analysis (80m & 110m Extension) -->')
    xml_lines.append('  <cosy-slide id="slide-case-study" stage="adaptation" duration="80" mode="all">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> deep-dive case study analysis for 90-min and 120-min lesson formats.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-instruction>{escape_xml(case_study_intro)}</cosy-instruction>')
    xml_lines.append('    <cosy-blockquote importance="high">')
    xml_lines.append(f'      <p><strong>Scenario:</strong> An international organization is deciding whether to adopt a mandatory policy regarding <strong>{escape_xml(parsed_data["title"])}</strong>. Evaluate the economic, ethical, and social consequences before voting on a final decision.</p>')
    xml_lines.append('    </cosy-blockquote>')
    xml_lines.append('  </cosy-slide>')

    # SLIDE 9: Group Workshop & Synthesis Presentation (110m - 120-min Group Lessons Only)
    xml_lines.append('\n  <!-- SLIDE 9: Group Workshop & Synthesis Presentation (110m Group Format Only) -->')
    xml_lines.append('  <cosy-slide id="slide-group-workshop" stage="adaptation" duration="110" mode="group">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> collaborative group breakout task and synthesis presentation for 120-minute group sessions.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-group-instruction>{escape_xml(workshop_intro)}</cosy-group-instruction>')
    xml_lines.append('    <ol>')
    xml_lines.append(f'      <li>In breakout pairs, design a comprehensive action proposal addressing <strong>{escape_xml(parsed_data["title"])}</strong>.</li>')
    xml_lines.append('      <li>Present your 3-minute synthesis pitch to the full group and defend your recommendations against peer questions.</li>')
    xml_lines.append('    </ol>')
    xml_lines.append('  </cosy-slide>')

    # SLIDE 10: Outro & Language Feedback (All durations)
    mistakes_raw = re.findall(r'<div class="mistake-item"[^>]*>(.*?)</div>', parsed_data["mistakes_html"], re.DOTALL)
    xml_lines.append('\n  <!-- SLIDE 10: Outro & Language Feedback -->')
    xml_lines.append('  <cosy-slide id="slide-7" stage="cool-down" duration="15" mode="all">')
    xml_lines.append('    <cosy-teacher-notes type="additional">')
    xml_lines.append(f'      <p><cosy-text type="strong">{escape_xml(error_note_title)}:</cosy-text></p>')
    if mistakes_raw:
        xml_lines.append('      <ul>')
        for m in mistakes_raw:
            wrong_m = re.search(r'class="mistake-wrong"[^>]*>(.*?)</span>', m, re.DOTALL)
            right_m = re.search(r'class="mistake-right"[^>]*>(.*?)</span>', m, re.DOTALL)
            note_m = re.search(r'class="mistake-note-text"[^>]*>(.*?)</span>', m, re.DOTALL)
            wrong_txt = clean_text(wrong_m.group(1)) if wrong_m else ""
            right_txt = clean_text(right_m.group(1)) if right_m else ""
            note_txt = clean_text(note_m.group(1)) if note_m else ""
            line_str = f"Incorrect: {wrong_txt} → Correct: {right_txt}"
            if note_txt:
                line_str += f" ({note_txt})"
            xml_lines.append(f'        <li>{escape_xml(line_str)}</li>')
        xml_lines.append('      </ul>')
    else:
        xml_lines.append('      <p>Review key vocabulary collocations, preposition usage, and pronunciation points from today\'s session.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-instruction>{escape_xml("Reflection & Feedback: Summarize main takeaways and review language highlights with your teacher.") if lang=="en" else escape_xml("Bilan et retours : révisez les points clés du cours avec votre professeur.") if lang=="fr" else escape_xml("Итоги и обратная связь: разберите ключевые языковые моменты с преподавателем.")}</cosy-instruction>')
    xml_lines.append('  </cosy-slide>')

    xml_lines.append('</cosy-lesson>')
    return "\n".join(xml_lines)

def register_in_roadmap(lesson_id, title, level, lang="en"):
    roadmap_filename = f"spoken-{lang.lower() if lang else 'en'}-{level.lower()}.json"
    roadmap_path = os.path.join("roadmaps", roadmap_filename)
    if not os.path.exists(roadmap_path):
        roadmap_filename = f"general-{lang.lower() if lang else 'en'}-{level.lower()}.json"
        roadmap_path = os.path.join("roadmaps", roadmap_filename)

    if os.path.exists(roadmap_path):
        try:
            with open(roadmap_path, "r", encoding="utf-8") as f:
                rm_data = json.load(f)

            sequence = rm_data.get("sequence", [])
            if not any(item.get("id") == lesson_id for item in sequence):
                new_num = len(sequence) + 1
                sequence.append({
                    "lessonNumber": new_num,
                    "id": lesson_id,
                    "title": title,
                    "module": "COSYevents Converted Sessions",
                    "status": "active"
                })
                rm_data["sequence"] = sequence
                rm_data["totalLessons"] = len(sequence)
                with open(roadmap_path, "w", encoding="utf-8") as f:
                    json.dump(rm_data, f, indent=2, ensure_ascii=False)
                print(f"Registered {lesson_id} in {roadmap_path} as Lesson #{new_num}")
        except Exception as e:
            print(f"Roadmap registration notice: {e}")

def convert_session(source_path_or_url, output_file=None, lesson_id=None):
    raw_html, url = fetch_html(source_path_or_url)
    parsed = parse_session_html(raw_html, url)
    final_lid = lesson_id or parsed["filename"]
    xml_content = generate_lesson_xml(parsed, lesson_id=final_lid)

    if output_file:
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(xml_content)
        print(f"Successfully generated {output_file}")
        register_in_roadmap(final_lid, parsed["title"], parsed["level"], parsed["lang"])

    return xml_content

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/convert-session-to-lesson.py <source_path_or_url> [output_file] [lesson_id]")
        sys.exit(1)

    src = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 3 else (sys.argv[2] if len(sys.argv) > 2 and sys.argv[2].endswith('.xml') else None)
    lid = sys.argv[3] if len(sys.argv) > 3 else (sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].endswith('.xml') else None)

    if len(sys.argv) == 3 and not sys.argv[2].endswith('.xml'):
        out = f"lessons/{sys.argv[2]}.xml"
        lid = sys.argv[2]

    convert_session(src, output_file=out, lesson_id=lid)
