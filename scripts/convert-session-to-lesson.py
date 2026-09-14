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

def generate_lesson_xml(parsed_data, lesson_id=None):
    if not lesson_id:
        lesson_id = parsed_data["filename"]

    lang = parsed_data["lang"]

    if lang == "fr":
        group_intro_r1 = "En binôme ou en sous-groupe, discutez des questions suivantes :"
        ind_intro_r1 = "Discutez des questions suivantes avec votre professeur :"
        group_intro_r2 = "En binôme, débattez et exprimez votre accord ou désaccord sur ces affirmations :"
        ind_intro_r2 = "Exprimez votre accord ou désaccord sur ces affirmations et discutez-en avec votre professeur :"
        lst_group_intro = "En binôme, réalisez la tâche visuelle/interactive suivante :"
        lst_ind_intro = "Examinez les éléments et répondez à la tâche avec votre professeur :"
        debate_ind_intro = "Votre professeur défendra le Côté A ; vous défendrez le Côté B. Débattez du scénario ensemble :"
        roleplay_ind_intro = "Votre professeur prendra le rôle complémentaire. Discutez de la situation ensemble :"
        vocab_intro = "Révisez le vocabulaire clé de la session ci-dessous :"
        error_note_title = "Notes de correction linguistique du professeur"
    elif lang == "ru":
        group_intro_r1 = "В парах или малых группах обсудите следующие вопросы:"
        ind_intro_r1 = "Обсудите следующие вопросы с преподавателем:"
        group_intro_r2 = "В парах выразите свое согласие или несогласие с утверждениями:"
        ind_intro_r2 = "Выразите свое согласие или несогласие с утверждениями и обсудите их с преподавателем:"
        lst_group_intro = "В парах выполните следующее интерактивное задание:"
        lst_ind_intro = "Изучите материалы и выполните задание вместе с преподавателем:"
        debate_ind_intro = "Преподаватель выступит за Сторону А, а вы — за Сторону Б. Проведите дискуссию вместе:"
        roleplay_ind_intro = "Преподаватель сыграет вторую роль в сценарии. Обсудите ситуацию вместе:"
        vocab_intro = "Изучите ключевую лексику занятия:"
        error_note_title = "Заметки преподавателя по языковым ошибкам"
    else:
        group_intro_r1 = "In pairs or small breakout groups, discuss the following questions:"
        ind_intro_r1 = "Discuss the following questions with your teacher:"
        group_intro_r2 = "In pairs, debate and state whether you agree or disagree with these statements:"
        ind_intro_r2 = "Share whether you agree or disagree with these statements and discuss them with your teacher:"
        lst_group_intro = "In pairs, work together on the following task:"
        lst_ind_intro = "Look at the prompt and discuss your response with your teacher:"
        debate_ind_intro = "Your teacher will present Side A; you will present Side B. Discuss the scenario together:"
        roleplay_ind_intro = "Your teacher will play the counterpart role in this scenario. Discuss together:"
        vocab_intro = "Review the key vocabulary for this session below:"
        error_note_title = "Teacher's Linguistic Error Correction Guidance"

    xml_lines = []
    xml_lines.append(f'<!-- source: {parsed_data["url"]} -->')
    xml_lines.append(f'<cosy-lesson id="{escape_xml(lesson_id)}" level="{escape_xml(parsed_data["level"])}" language="{escape_xml(lang)}" title="{escape_xml(parsed_data["title"])}" default-duration="50" default-mode="all">')

    # SLIDE 1: Warm-up Vocabulary (mode="all")
    xml_lines.append('  <!-- SLIDE 1: Warm-up & Vocabulary Review -->')
    xml_lines.append('  <cosy-slide id="slide-1" stage="warm-up" duration="50" mode="all">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append(f'      <p><cosy-text type="strong">Stage aim:</cosy-text> to introduce the topic and clarify key target vocabulary for the session.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-instruction>{escape_xml(vocab_intro)}</cosy-instruction>')

    if parsed_data["vocab_items"]:
        for item in parsed_data["vocab_items"]:
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
        xml_lines.append(f'      <p>Welcome to <strong>{escape_xml(parsed_data["title"])}</strong>! Get ready to explore key concepts and share your ideas.</p>')
        xml_lines.append('    </cosy-blockquote>')

    xml_lines.append('  </cosy-slide>')

    # SLIDE 2 & 3: Round 1 (Group & Individual Sibling Slides)
    r1_items, r1_type = extract_round_items(parsed_data["r1_html"])
    # Precise roleplay check (requiring roleplay / speaker a / jeu de rôle / ролевая)
    is_roleplay = any(
        re.search(r'\b(roleplay|role play|speaker a|jeu de rôle|ролевая)\b', (i.get("main", "")).lower())
        for i in r1_items
    )

    xml_lines.append('\n  <!-- SLIDE 2: Round 1 Discussion (Group Mode) -->')
    xml_lines.append('  <cosy-slide id="slide-2-group" stage="round-1" duration="50" mode="group">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> pair/group discussion on core session themes.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-group-instruction>{escape_xml(group_intro_r1)}</cosy-group-instruction>')
    xml_lines.append('    <ol>')
    for item in r1_items:
        if r1_type == "debate_sides":
            xml_lines.append(f'      <li><strong>{escape_xml(item["title"])}:</strong> {escape_xml(item["text"])}</li>')
        else:
            main_t = item["main"]
            pers_t = item["personal"]
            if pers_t:
                xml_lines.append(f'      <li>{escape_xml(main_t)}<br/><em>{escape_xml(pers_t)}</em></li>')
            else:
                xml_lines.append(f'      <li>{escape_xml(main_t)}</li>')
    xml_lines.append('    </ol>')
    xml_lines.append('  </cosy-slide>')

    xml_lines.append('\n  <!-- SLIDE 3: Round 1 Discussion (Individual Mode) -->')
    xml_lines.append('  <cosy-slide id="slide-2-ind" stage="round-1" duration="50" mode="individual">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> 1-on-1 teacher-student discussion on core session themes.</p>')
    xml_lines.append('    </cosy-teacher-notes>')

    if r1_type == "debate_sides":
        xml_lines.append(f'    <cosy-instruction>{escape_xml(debate_ind_intro)}</cosy-instruction>')
    elif is_roleplay:
        xml_lines.append(f'    <cosy-instruction>{escape_xml(roleplay_ind_intro)}</cosy-instruction>')
    else:
        xml_lines.append(f'    <cosy-instruction>{escape_xml(ind_intro_r1)}</cosy-instruction>')

    xml_lines.append('    <ol>')
    for item in r1_items:
        if r1_type == "debate_sides":
            xml_lines.append(f'      <li><strong>{escape_xml(item["title"])}:</strong> {escape_xml(item["text"])}</li>')
        else:
            main_t = adapt_roleplay_text(item["main"], lang)
            pers_t = adapt_roleplay_text(item["personal"], lang)
            if pers_t:
                xml_lines.append(f'      <li>{escape_xml(main_t)}<br/><em>{escape_xml(pers_t)}</em></li>')
            else:
                xml_lines.append(f'      <li>{escape_xml(main_t)}</li>')
    xml_lines.append('    </ol>')
    xml_lines.append('  </cosy-slide>')

    # SLIDE 4 & 5: Let's Speak Together (Group & Individual Sibling Slides)
    lst_group_txt, lst_ind_txt, lst_imgs = extract_lst_content(parsed_data["lst_html"], lang)

    xml_lines.append('\n  <!-- SLIDE 4: Let\'s Speak Together (Group Mode) -->')
    xml_lines.append('  <cosy-slide id="slide-3-group" stage="speak-together" duration="50" mode="group">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> collaborative task or visual analysis in pairs/groups.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-group-instruction>{escape_xml(lst_group_intro)}</cosy-group-instruction>')

    if lst_imgs:
        xml_lines.append('    <cosy-choice-image>')
        for img_src, img_alt in lst_imgs:
            xml_lines.append(f'      <cosy-choice-image-option resource-id="{escape_xml(img_src)}"><p>{escape_xml(img_alt)}</p></cosy-choice-image-option>')
        xml_lines.append('    </cosy-choice-image>')

    xml_lines.append('    <cosy-blockquote importance="medium">')
    xml_lines.append(f'      <p>{escape_xml(lst_group_txt)}</p>')
    xml_lines.append('    </cosy-blockquote>')
    xml_lines.append('  </cosy-slide>')

    xml_lines.append('\n  <!-- SLIDE 5: Let\'s Speak Together (Individual Mode) -->')
    xml_lines.append('  <cosy-slide id="slide-3-ind" stage="speak-together" duration="50" mode="individual">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> 1-on-1 guided visual description and task response with teacher.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-instruction>{escape_xml(lst_ind_intro)}</cosy-instruction>')

    if lst_imgs:
        xml_lines.append('    <cosy-choice-image>')
        for img_src, img_alt in lst_imgs:
            xml_lines.append(f'      <cosy-choice-image-option resource-id="{escape_xml(img_src)}"><p>{escape_xml(img_alt)}</p></cosy-choice-image-option>')
        xml_lines.append('    </cosy-choice-image>')

    xml_lines.append('    <cosy-blockquote importance="medium">')
    xml_lines.append(f'      <p>{escape_xml(lst_ind_txt)}</p>')
    xml_lines.append('    </cosy-blockquote>')
    xml_lines.append('  </cosy-slide>')

    # SLIDE 6 & 7: Round 2 (Group & Individual Sibling Slides)
    r2_items, r2_type = extract_round_items(parsed_data["r2_html"])

    xml_lines.append('\n  <!-- SLIDE 6: Round 2 Discussion (Group Mode) -->')
    xml_lines.append('  <cosy-slide id="slide-4-group" stage="round-2" duration="50" mode="group">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> deeper debate and statement evaluation in pairs/groups.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-group-instruction>{escape_xml(group_intro_r2)}</cosy-group-instruction>')
    xml_lines.append('    <ol>')
    for item in r2_items:
        if r2_type == "debate_sides":
            xml_lines.append(f'      <li><strong>{escape_xml(item["title"])}:</strong> {escape_xml(item["text"])}</li>')
        else:
            main_t = item["main"]
            pers_t = item["personal"]
            if pers_t:
                xml_lines.append(f'      <li>{escape_xml(main_t)}<br/><em>{escape_xml(pers_t)}</em></li>')
            else:
                xml_lines.append(f'      <li>{escape_xml(main_t)}</li>')
    xml_lines.append('    </ol>')
    xml_lines.append('  </cosy-slide>')

    xml_lines.append('\n  <!-- SLIDE 7: Round 2 Discussion (Individual Mode) -->')
    xml_lines.append('  <cosy-slide id="slide-4-ind" stage="round-2" duration="50" mode="individual">')
    xml_lines.append('    <cosy-teacher-notes type="instruction">')
    xml_lines.append('      <p><cosy-text type="strong">Stage aim:</cosy-text> deeper debate and statement evaluation with teacher in 1-on-1 format.</p>')
    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-instruction>{escape_xml(ind_intro_r2)}</cosy-instruction>')
    xml_lines.append('    <ol>')
    for item in r2_items:
        if r2_type == "debate_sides":
            xml_lines.append(f'      <li><strong>{escape_xml(item["title"])}:</strong> {escape_xml(item["text"])}</li>')
        else:
            main_t = adapt_roleplay_text(item["main"], lang)
            pers_t = adapt_roleplay_text(item["personal"], lang)
            if pers_t:
                xml_lines.append(f'      <li>{escape_xml(main_t)}<br/><em>{escape_xml(pers_t)}</em></li>')
            else:
                xml_lines.append(f'      <li>{escape_xml(main_t)}</li>')
    xml_lines.append('    </ol>')
    xml_lines.append('  </cosy-slide>')

    # SLIDE 8: Teacher Notes / Mistakes (mode="all")
    mistakes_raw = re.findall(r'<div class="mistake-item"[^>]*>(.*?)</div>', parsed_data["mistakes_html"], re.DOTALL)

    xml_lines.append('\n  <!-- SLIDE 8: Teacher\'s Note / Error Correction -->')
    xml_lines.append('  <cosy-slide id="slide-5" stage="error-correction" duration="50" mode="all">')
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
        xml_lines.append('      <p>Pay close attention to prepositions, article usage, and collocations related to this topic during student speech.</p>')

    xml_lines.append('    </cosy-teacher-notes>')
    xml_lines.append(f'    <cosy-instruction>{escape_xml("Reflection & Feedback: Review language highlights and key corrections with your teacher.") if lang=="en" else escape_xml("Bilan et retours : révisez les corrections linguistiques clés avec votre professeur.") if lang=="fr" else escape_xml("Итоги и обратная связь: разберите ключевые языковые моменты с преподавателем.")}</cosy-instruction>')
    xml_lines.append('  </cosy-slide>')

    xml_lines.append('</cosy-lesson>')
    return "\n".join(xml_lines)

def convert_session(source_path_or_url, output_file=None, lesson_id=None):
    raw_html, url = fetch_html(source_path_or_url)
    parsed = parse_session_html(raw_html, url)
    xml_content = generate_lesson_xml(parsed, lesson_id=lesson_id)

    if output_file:
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(xml_content)
        print(f"Successfully generated {output_file}")
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
