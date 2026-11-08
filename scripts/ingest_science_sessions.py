import urllib.request, re, html, json, os

SESSIONS = [
  "ai-and-the-brain-intermediate.html",
  "ai-and-the-brain-upper-intermediate.html",
  "ai-reality-delusion.html",
  "animal-cooperation-language-intermediate.html",
  "animal-cooperation-language-upper-intermediate.html",
  "ape-laughter-speech-origin-elementary.html",
  "ape-laughter-speech-origin-intermediate.html",
  "brain-cells-motivation-advanced.html",
  "brain-cells-motivation-intermediate.html",
  "brain-improving-in-90s-intermediate.html",
  "brain-improving-in-90s-upper-intermediate.html",
  "childhood-obesity-theory-elementary.html",
  "childhood-obesity-theory-intermediate.html",
  "childhood-obesity-theory-upper-intermediate.html",
  "climate-scientist-warming-report-intermediate.html",
  "climate-scientist-warming-report-upper-intermediate.html",
  "coffee-fat-muscle-hormones-advanced.html",
  "football-beats-shamrock-intermediate.html",
  "football-beats-shamrock-upper-intermediate.html",
  "fusion-energy.html",
  "grandmother-evolutionary-mystery.html",
  "grandparents-mental-health.html",
  "gut-brain-memory-intermediate.html",
  "hidden-regenerative-powers-intermediate.html",
  "hidden-regenerative-powers-upper-intermediate.html",
  "human-family-tree-rewrite-advanced.html",
  "impersonation-accounts.html",
  "inside-the-backrooms-elementary.html",
  "inside-the-backrooms-intermediate.html",
  "living-most-creative-time.html",
  "losing-spoken-words.html",
  "mendelian-laws-broken.html",
  "multilingual-younger-brains-elementary.html",
  "multilingual-younger-brains-intermediate.html",
  "museums-movies-theater-stay-younger-elementary.html",
  "museums-movies-theater-stay-younger-intermediate.html",
  "museums-movies-theater-stay-younger-upper-intermediate.html",
  "ordinary-wifi-identification-elementary.html",
  "ordinary-wifi-identification-intermediate.html",
  "ozempic-obesity-revolution-intermediate.html",
  "ozempic-obesity-revolution-upper-intermediate.html",
  "recycling-distraction-test-intermediate.html",
  "right-handedness.html",
  "screen-time-kids-8-years-intermediate.html",
  "sensory-system-pain-disease-intermediate.html",
  "sensory-system-pain-disease-upper-intermediate.html",
  "sitting-up-straight-elementary.html",
  "sitting-up-straight-intermediate.html",
  "social-decisions-brain.html",
  "spider-creatures-origins-of-fatherhood-intermediate.html",
  "spider-creatures-origins-of-fatherhood-upper-intermediate.html",
  "tv-midlife-shrink-brain-intermediate.html",
  "where-you-live-shapes-dementia-risk-elementary.html",
  "where-you-live-shapes-dementia-risk-intermediate.html",
  "where-you-live-shapes-dementia-risk-upper-intermediate.html",
  "your-fingers-hold-secret-brain-evolution-intermediate.html",
  "your-fingers-hold-secret-brain-evolution-upper-intermediate.html"
]

def clean_html(text):
    if not text:
        return ""
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.split("\n")]
    return "\n".join([line for line in lines if line])

def convert_session_html_to_lesson_json(slug, html_content):
    title_m = re.search(r"<h1>(.*?)</h1>", html_content, re.DOTALL)
    title = clean_html(title_m.group(1)) if title_m else slug.replace("-", " ").title()
    title = re.sub(r"\s+", " ", title).strip()

    meta_matches = re.findall(r"<h4>(.*?)</h4>\s*<p>(.*?)</p>", html_content, re.DOTALL)
    meta = {clean_html(k): clean_html(v) for k, v in meta_matches}

    level_raw = meta.get("Level", "Intermediate (B1)")
    if "Elementary" in level_raw or "A2" in level_raw:
        cefr = "a2"
    elif "Advanced" in level_raw or "C1" in level_raw or "C2" in level_raw:
        cefr = "c1"
    elif "Upper-Intermediate" in level_raw or "B2" in level_raw:
        cefr = "b2"
    elif "Intermediate" in level_raw or "B1" in level_raw:
        cefr = "b1"
    else:
        cefr = "b1"

    # 1. Topic & Field Journal Log
    journal_items = re.findall(r"<div class=\"science-journal-item\">(.*?)</div>\s*(?=<div class=\"science-journal-item\"|</div>\s*</div>|\Z)", html_content, re.DOTALL)
    journal_clean = [clean_html(item) for item in journal_items if clean_html(item)]

    # 2. Target Vocabulary Cards
    vocab_cards = re.findall(r"<div class=\"vocab-card\">(.*?)</div>\s*(?=<div class=\"vocab-card\"|</div>\s*</section>|\Z)", html_content, re.DOTALL)
    parsed_vocab = []
    for c in vocab_cards:
        word_m = re.search(r"<div class=\"vocab-word\">(.*?)</div>", c, re.DOTALL)
        def_m = re.search(r"<div class=\"vocab-def\">(.*?)</div>", c, re.DOTALL)
        ex_m = re.search(r"<div class=\"vocab-example\">(.*?)</div>", c, re.DOTALL)
        w_t = clean_html(word_m.group(1)) if word_m else ""
        d_t = clean_html(def_m.group(1)) if def_m else ""
        e_t = clean_html(ex_m.group(1)) if ex_m else ""
        if w_t:
            parsed_vocab.append({"word": w_t, "definition": d_t, "example": e_t})

    # 3. Warm-up
    warmup_m = re.search(r"<div[^>]*id=[\"']s-warm[\"'][^>]*>(.*?)</div>\s*</div>(?=\s*<div\s+class=[\"']round-block|\Z)", html_content, re.DOTALL)
    warmup_text = ""
    if warmup_m:
        w_body = re.search(r"<div class=\"round-body\"[^>]*>(.*)", warmup_m.group(1), re.DOTALL)
        if w_body:
            warmup_text = clean_html(w_body.group(1))

    # 4. Grammar / Language Focus
    grammar_m = re.search(r"<div[^>]*id=[\"']s-grammar[\"'][^>]*>(.*?)</div>\s*</div>(?=\s*<div\s+class=[\"']round-block|\Z)", html_content, re.DOTALL)
    grammar_text = ""
    if grammar_m:
        g_body = re.search(r"<div class=\"round-body\"[^>]*>(.*)", grammar_m.group(1), re.DOTALL)
        if g_body:
            grammar_text = clean_html(g_body.group(1))

    # 5. Round 1 Questions
    r1_m = re.search(r"<div[^>]*id=[\"']s-r1[\"'][^>]*>(.*?)</div>\s*</div>(?=\s*<div\s+class=[\"']round-block|\Z)", html_content, re.DOTALL)
    r1_items = []
    if r1_m:
        matches = re.findall(r"<div class=\"round-item\">(.*?)</div>\s*</div>", r1_m.group(1), re.DOTALL)
        for m in matches:
            main_q = re.search(r"<div class=\"round-item-main\">(.*?)</div>", m, re.DOTALL)
            pers_q = re.search(r"<div class=\"round-item-personal\">(.*?)</div>", m, re.DOTALL)
            main_txt = clean_html(main_q.group(1)) if main_q else ""
            pers_txt = clean_html(pers_q.group(1)) if pers_q else ""
            if main_txt or pers_txt:
                full_q = f"• {main_txt}" + (f"\n  {pers_txt}" if pers_txt else "")
                r1_items.append(full_q)

    # 6. Language Structure Task (s-lst)
    lst_m = re.search(r"<div[^>]*id=[\"']s-lst[\"'][^>]*>(.*?)</div>\s*</div>(?=\s*<div\s+class=[\"']round-block|\Z)", html_content, re.DOTALL)
    lst_text = ""
    if lst_m:
        l_body = re.search(r"<div class=\"round-body\"[^>]*>(.*)", lst_m.group(1), re.DOTALL)
        if l_body:
            lst_text = clean_html(l_body.group(1))

    # 7. Scientific Thinking & Analysis
    thinking_m = re.search(r"<div[^>]*id=[\"']s-thinking[\"'][^>]*>(.*?)</div>\s*</div>(?=\s*<div\s+class=[\"']round-block|\Z)", html_content, re.DOTALL)
    thinking_text = ""
    if thinking_m:
        t_body = re.search(r"<div class=\"round-body\"[^>]*>(.*)", thinking_m.group(1), re.DOTALL)
        if t_body:
            thinking_text = clean_html(t_body.group(1))

    # 8. Headline Task
    headline_m = re.search(r"<div[^>]*id=[\"']s-headline[\"'][^>]*>(.*?)</div>\s*</div>(?=\s*<div\s+class=[\"']round-block|\Z)", html_content, re.DOTALL)
    headline_text = ""
    if headline_m:
        h_body = re.search(r"<div class=\"round-body\"[^>]*>(.*)", headline_m.group(1), re.DOTALL)
        if h_body:
            headline_text = clean_html(h_body.group(1))

    # 9. Round 2 Questions / Debates
    r2_m = re.search(r"<div[^>]*id=[\"']s-r2[\"'][^>]*>(.*?)</div>\s*</div>(?=\s*<div\s+class=[\"']round-block|\Z)", html_content, re.DOTALL)
    r2_items = []
    if r2_m:
        matches = re.findall(r"<div class=\"round-item\">(.*?)</div>\s*</div>", r2_m.group(1), re.DOTALL)
        for m in matches:
            main_q = re.search(r"<div class=\"round-item-main\">(.*?)</div>", m, re.DOTALL)
            pers_q = re.search(r"<div class=\"round-item-personal\">(.*?)</div>", m, re.DOTALL)
            main_txt = clean_html(main_q.group(1)) if main_q else ""
            pers_txt = clean_html(pers_q.group(1)) if pers_q else ""
            if main_txt or pers_txt:
                full_q = f"• {main_txt}" + (f"\n  {pers_txt}" if pers_txt else "")
                r2_items.append(full_q)

    # 10. TED Talk / Challenge
    ted_m = re.search(r"<div[^>]*id=[\"']s-ted[\"'][^>]*>(.*?)</div>\s*</div>(?=\s*<div\s+class=[\"']mistake-block|\Z)", html_content, re.DOTALL)
    ted_text = ""
    if ted_m:
        t_body = re.search(r"<div class=\"round-body\"[^>]*>(.*)", ted_m.group(1), re.DOTALL)
        if t_body:
            ted_text = clean_html(t_body.group(1))

    # 11. Linguistic Corrections / Teacher Notes
    mistakes_m = re.search(r"<div class=\"mistake-body\"[^>]*>(.*?)</div>\s*</div>", html_content, re.DOTALL)
    mistakes_items = []
    if mistakes_m:
        m_items = re.findall(r"<div class=\"mistake-item\">(.*?)</div>", mistakes_m.group(1), re.DOTALL)
        for mi in m_items:
            w = clean_html(re.search(r"<span class=\"mistake-wrong\">(.*?)</span>", mi, re.DOTALL).group(1)) if "mistake-wrong" in mi else ""
            r = clean_html(re.search(r"<span class=\"mistake-right\">(.*?)</span>", mi, re.DOTALL).group(1)) if "mistake-right" in mi else ""
            n = clean_html(re.search(r"<span class=\"mistake-note-text\">(.*?)</span>", mi, re.DOTALL).group(1)) if "mistake-note-text" in mi else ""
            if w or r:
                mistakes_items.append(f"❌ {w} ➔ ✔️ {r} {n}".strip())

    slides = []
    slide_num = 1

    # Slide 1: Lead-in & Research Context
    s1_elements = [
        {"type": "instruction", "content": "Welcome to Keeping Up with Science. Review the research context and metadata below:"}
    ]
    meta_str = "\n".join([f"• {k}: {v}" for k, v in meta.items()])
    if meta_str:
        s1_elements.append({"type": "blockquote", "content": f"Session Overview:\n{meta_str}"})
    if journal_clean:
        s1_elements.append({"type": "instruction", "content": "🔬 Field Journal Research Log:"})
        s1_elements.append({"type": "blockquote", "content": "\n\n".join(journal_clean)})
    if warmup_text:
        s1_elements.append({"type": "instruction", "content": "Lead-in / Warm-up Questions:"})
        s1_elements.append({"type": "blockquote", "content": warmup_text})

    slides.append({
        "id": f"slide-{slide_num}",
        "title": "Lead-in & Field Journal Context",
        "stage": "Warm-up & Context",
        "elements": s1_elements
    })
    slide_num += 1

    # Slide 2: Target Vocabulary
    if parsed_vocab:
        v_lines = []
        for v in parsed_vocab:
            entry = f"• {v['word']}: {v['definition']}"
            if v['example']:
                entry += f"\n   Example: \"{v['example']}\""
            v_lines.append(entry)

        slides.append({
            "id": f"slide-{slide_num}",
            "title": "Target Vocabulary & Key Terms",
            "stage": "Vocabulary Presentation",
            "elements": [
                {"type": "instruction", "content": f"Master the core scientific vocabulary and collocations for this topic ({len(parsed_vocab)} items):"},
                {"type": "blockquote", "content": "\n\n".join(v_lines[:5])},
                *( [{"type": "blockquote", "content": "\n\n".join(v_lines[5:])}] if len(v_lines) > 5 else [] ),
                {"type": "instruction", "content": "Controlled Practice: Select 2-3 target words and use them in original example sentences:"},
                {"type": "essay", "placeholder": "Write your practice sentences using the target vocabulary here..."}
            ]
        })
        slide_num += 1

    # Slide 3: Language Focus & Structural Patterns
    if grammar_text or lst_text:
        s3_elements = []
        if grammar_text:
            s3_elements.extend([
                {"type": "instruction", "content": "Study the scientific discourse patterns and grammar structures:"},
                {"type": "blockquote", "content": grammar_text}
            ])
        if lst_text:
            s3_elements.extend([
                {"type": "instruction", "content": "Language Structure Task (Sentence Building):"},
                {"type": "blockquote", "content": lst_text}
            ])
        slides.append({
            "id": f"slide-{slide_num}",
            "title": "Language Focus & Structural Patterns",
            "stage": "Language Focus",
            "elements": s3_elements
        })
        slide_num += 1

    # Slide 4: Round 1 Comprehension & Core Questions
    if r1_items:
        slides.append({
            "id": f"slide-{slide_num}",
            "title": "Round 1: Comprehension & Core Findings",
            "stage": "Fluency Practice",
            "elements": [
                {"type": "instruction", "content": "Analyze the core scientific findings and discuss the personal prompts in pairs:"},
                {"type": "blockquote", "content": "\n\n".join(r1_items[:5])},
                *( [{"type": "blockquote", "content": "\n\n".join(r1_items[5:])}] if len(r1_items) > 5 else [] ),
                {"type": "essay", "placeholder": "Record your partner's key arguments or shared hypotheses..."}
            ]
        })
        slide_num += 1

    # Slide 5: Scientific Thinking & Creative Task
    if thinking_text or headline_text:
        s5_elements = []
        if thinking_text:
            s5_elements.extend([
                {"type": "instruction", "content": "💡 Scientific Thinking & Critical Analysis:"},
                {"type": "blockquote", "content": thinking_text}
            ])
        if headline_text:
            s5_elements.extend([
                {"type": "instruction", "content": "📰 Creative Task: Complete the Headline:"},
                {"type": "blockquote", "content": headline_text}
            ])
        s5_elements.append({"type": "input", "placeholder": "Draft your team's breaking scientific headline..."})
        slides.append({
            "id": f"slide-{slide_num}",
            "title": "Scientific Thinking & Creative Task",
            "stage": "Deep Analysis",
            "elements": s5_elements
        })
        slide_num += 1

    # Slide 6: Round 2 Projections & Debate
    if r2_items:
        slides.append({
            "id": f"slide-{slide_num}",
            "title": "Round 2: Future Projections & Debate",
            "stage": "Debate & Future Outlook",
            "elements": [
                {"type": "instruction", "content": "Discuss future societal implications, ethical dilemmas, and technological projections:"},
                {"type": "blockquote", "content": "\n\n".join(r2_items[:5])},
                *( [{"type": "blockquote", "content": "\n\n".join(r2_items[5:])}] if len(r2_items) > 5 else [] ),
                {"type": "essay", "placeholder": "Take notes on ethical dilemmas or future consensus reached..."}
            ]
        })
        slide_num += 1

    # Slide 7: Final Production / TED Talk Presentation
    if ted_text:
        slides.append({
            "id": f"slide-{slide_num}",
            "title": "Final Challenge: Science Presentation",
            "stage": "Presentation & Production",
            "elements": [
                {"type": "instruction", "content": "Deliver your 1-minute presentation or summary based on the challenge below:"},
                {"type": "blockquote", "content": ted_text},
                {"type": "essay", "placeholder": "Prepare speech notes or delivery bullet points..."}
            ]
        })
        slide_num += 1

    # Final Slide: Feedback & Linguistic Corrections
    s_last_elements = []
    if mistakes_items:
        s_last_elements.extend([
            {"type": "instruction", "content": "✏️ Common Linguistic Pitfalls & Target Corrections:"},
            {"type": "blockquote", "content": "\n".join(mistakes_items)}
        ])
    s_last_elements.extend([
        {"type": "instruction", "content": "Teacher's real-time error corrections, pronunciation feedback, and notes:"},
        {"type": "essay", "placeholder": "Teacher live feedback notes..."}
    ])
    slides.append({
        "id": f"slide-{slide_num}",
        "title": "Linguistic Corrections & Teacher Feedback",
        "stage": "Wrap-up & Feedback",
        "elements": s_last_elements
    })

    return {
        "id": slug,
        "title": f"Keeping Up with Science: {title}",
        "level": cefr.upper(),
        "templateType": "speaking_club",
        "durationMinutes": 60,
        "slides": slides
    }, cefr, title

def main():
    target_dir = os.path.join(os.path.dirname(__file__), "..", "lessons", "science-en")
    os.makedirs(target_dir, exist_ok=True)

    metadata_list = []
    print(f"Ingesting {len(SESSIONS)} sessions with complete components (lead-in, vocab, discussion, analysis, feedback)...")
    for s in SESSIONS:
        url = f"https://raw.githubusercontent.com/cosylanguages/COSYevents/main/sessions/keeping-up-with-science/{s}"
        with urllib.request.urlopen(url) as resp:
            content = resp.read().decode('utf-8')
        slug = s.replace(".html", "")
        lesson_json, cefr, title = convert_session_html_to_lesson_json(slug, content)

        out_path = os.path.join(target_dir, f"{slug}.json")
        with open(out_path, "w", encoding="utf-8") as out_fp:
            json.dump(lesson_json, out_fp, indent=2, ensure_ascii=False)

        metadata_list.append({
            "slug": slug,
            "title": lesson_json["title"],
            "level": cefr,
            "file": f"lessons/science-en/{slug}.json",
            "slidesCount": len(lesson_json["slides"])
        })
        print(f"  -> Generated {out_path} ({cefr.upper()}, {len(lesson_json['slides'])} slides)")

    manifest_path = os.path.join(target_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as m_fp:
        json.dump(metadata_list, m_fp, indent=2)
    print(f"Ingestion complete. Total lessons generated: {len(metadata_list)}")

if __name__ == "__main__":
    main()
