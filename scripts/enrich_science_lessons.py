import glob
import json
import re
import os

def parse_vocab_blockquote(content):
    """Parses a vocabulary blockquote into structured vocab items."""
    items = []
    parts = re.split(r'\n\s*•\s*', content.strip())
    for part in parts:
        cleaned = re.sub(r'^•\s*', '', part).strip()
        if not cleaned:
            continue
        lines = [l.strip() for l in cleaned.split('\n') if l.strip()]
        if not lines:
            continue
        first_line = lines[0]
        colon_idx = first_line.find(':')
        if colon_idx != -1:
            word = first_line[:colon_idx].strip()
            definition = first_line[colon_idx + 1:].strip()
        else:
            word = first_line
            definition = ""

        example = ""
        for line in lines[1:]:
            if line.lower().startswith('example:'):
                example = re.sub(r'^example:\s*', '', line, flags=re.IGNORECASE).strip().strip('"\'')
                break

        items.append({
            "word": word,
            "definition": definition,
            "example": example
        })
    return items

def parse_correction_blockquote(content):
    """Parses ❌ ... ➔ ✔️ ... lines into structured correction pairs."""
    pairs = []
    lines = [l.strip() for l in content.strip().split('\n') if l.strip()]
    for line in lines:
        if '❌' in line and '➔' in line:
            parts = line.split('➔')
            incorrect = parts[0].replace('❌', '').strip()
            right_part = parts[1].replace('✔️', '').strip()

            note_match = re.search(r'\((.*?)\)$', right_part)
            if note_match:
                note = note_match.group(1).strip()
                correct = right_part[:note_match.start()].strip()
            else:
                note = ""
                correct = right_part

            pairs.append({
                "incorrect": incorrect,
                "correct": correct,
                "note": note
            })
    return pairs

def parse_discussion_blockquote(content):
    """Parses discussion questions into a list of prompts."""
    prompts = []
    parts = re.split(r'\n\s*•\s*', content.strip())
    for part in parts:
        cleaned = re.sub(r'^•\s*', '', part).strip()
        if cleaned:
            prompts.append(cleaned)
    return prompts

def clean_lesson_data(data):
    """Transforms speaking club patterns into professional, cosy ESL lesson stages."""
    slides = data.get('slides', [])
    data['templateType'] = 'interactive_lesson'

    for slide in slides:
        title = slide.get('title', '')
        stage = slide.get('stage', '')

        # 1. Update slide titles & stages away from speaking club artefacts
        if title == "Lead-in & Field Journal Context" or "Field Journal" in title:
            slide['title'] = "Lead-in & Topic Discovery"
            slide['stage'] = "Warm-up & Context"
        elif title == "Target Vocabulary & Key Terms":
            slide['title'] = "Core Vocabulary & Collocations"
            slide['stage'] = "Vocabulary Discovery"
        elif title == "Language Focus & Structural Patterns":
            slide['title'] = "Language Focus & Grammar Spotlight"
            slide['stage'] = "Grammar & Patterns"
        elif "Round 1" in title or "Round 1: Comprehension & Core Findings" in title:
            slide['title'] = "Reading Insight & Comprehension"
            slide['stage'] = "Reading & Discovery"
        elif "Scientific Thinking & Creative Task" in title:
            slide['title'] = "Deep Dive & Critical Analysis"
            slide['stage'] = "Critical Analysis"
        elif "Round 2" in title or "Round 2: Future Projections & Debate" in title:
            slide['title'] = "Collaborative Discussion & Perspectives"
            slide['stage'] = "Interactive Discussion"
        elif "Final Challenge: Science Presentation" in title or "Final Challenge" in title:
            slide['title'] = "Guided Speaking & Production Task"
            slide['stage'] = "Speaking & Production"
        elif "Linguistic Corrections & Teacher Feedback" in title:
            slide['title'] = "Language Reflection & Feedback"
            slide['stage'] = "Wrap-up & Feedback"

        # Transform Slide 1 into a cosy lead-in card
        if slide['id'] == 'slide-1':
            elements = slide.get('elements', [])
            topic_name = ""
            hypothesis = ""
            findings = ""
            questions = []

            for el in elements:
                content = el.get('content', '')
                if 'Specimen / Topic' in content:
                    lines = [l.strip() for l in content.split('\n') if l.strip()]
                    for idx, line in enumerate(lines):
                        if 'Specimen / Topic' in line and idx + 1 < len(lines):
                            topic_name = lines[idx + 1]
                        elif 'Primary Hypothesis' in line and idx + 1 < len(lines):
                            hypothesis = lines[idx + 1]
                        elif 'Experimental Findings' in line and idx + 1 < len(lines):
                            findings = lines[idx + 1]
                elif '?' in content and not 'Specimen' in content and not 'Session Overview' in content:
                    # Lead-in questions
                    q_lines = [l.strip() for l in content.split('\n') if l.strip() and '?' in l]
                    questions.extend(q_lines)

            # Build clean conversational context
            context_text = f"Today we explore {topic_name or data.get('title', 'this fascinating scientific topic')}."
            if hypothesis or findings:
                context_text += f" Recent research explores whether {hypothesis.lower() if hypothesis else ''} Key insights show that: {findings}"

            slide['elements'] = [
                {
                    "type": "lead-in",
                    "title": "Topic Warm-up & Discovery",
                    "context": context_text.strip(),
                    "questions": questions if questions else [
                        "Have you recently followed news or breakthroughs related to this subject?",
                        "What is your personal perspective or initial thought on this topic?"
                    ]
                },
                {
                    "type": "instruction",
                    "content": "Share your initial impressions and thoughts with your partner or teacher:"
                },
                {
                    "type": "essay",
                    "placeholder": "Type your warm-up thoughts and speaking notes here..."
                }
            ]
            continue

        # Transform Slide 4 (formerly Round 1) into Reading Insight & Comprehension
        if slide['id'] == 'slide-4':
            elements = slide.get('elements', [])
            all_prompts = []
            for el in elements:
                if el.get('type') == 'discussion-prompts':
                    all_prompts.extend(el.get('prompts', []))
                elif el.get('type') == 'blockquote':
                    all_prompts.extend(parse_discussion_blockquote(el.get('content', '')))

            slide['elements'] = [
                {
                    "type": "reading-insight",
                    "source": "Research Digest & Findings",
                    "title": "Key Study Insights & Core Takeaways",
                    "text": "Researchers conducted in-depth investigations and empirical trials to analyze these phenomena. The findings reveal critical mechanisms that challenge earlier assumptions.",
                    "takeaway": "Understanding both biological and empirical evidence allows us to draw more grounded conclusions."
                },
                {
                    "type": "instruction",
                    "content": "Examine the core research findings and discuss the comprehension questions below:"
                },
                {
                    "type": "discussion-prompts",
                    "prompts": all_prompts if all_prompts else [
                        "According to the study, what are the primary findings and mechanisms identified?",
                        "How do these findings contrast with previous scientific assumptions?",
                        "Which aspect of the investigation do you find most convincing or surprising?"
                    ]
                },
                {
                    "type": "essay",
                    "placeholder": "Draft your answers and key takeaways here..."
                }
            ]
            continue

        # Transform Slide 6 (formerly Round 2) into Collaborative Discussion & Perspectives
        if slide['id'] == 'slide-6':
            elements = slide.get('elements', [])
            all_prompts = []
            for el in elements:
                if el.get('type') == 'discussion-prompts':
                    all_prompts.extend(el.get('prompts', []))
                elif el.get('type') == 'blockquote':
                    all_prompts.extend(parse_discussion_blockquote(el.get('content', '')))

            slide['elements'] = [
                {
                    "type": "instruction",
                    "content": "Explore broader perspectives, future societal impacts, and ethical considerations:"
                },
                {
                    "type": "discussion-prompts",
                    "prompts": all_prompts if all_prompts else [
                        "How might these discoveries shape everyday life or future technology in the coming decade?",
                        "What potential risks or ethical challenges should scientists address?",
                        "If you were leading the next phase of this research, which question would you investigate?"
                    ]
                },
                {
                    "type": "essay",
                    "placeholder": "Reflect on these questions and write down your arguments..."
                }
            ]
            continue

        # Clean remaining slides (instructions, prompts)
        new_elements = []
        for el in slide.get('elements', []):
            el_type = el.get('type')
            content = el.get('content', '')

            if el_type == 'instruction':
                # Remove robotic text
                cleaned_inst = content.replace('Deliver your 1-minute presentation or summary based on the challenge below:',
                                               'Prepare a clear 2-minute spoken summary or personal pitch based on the scenario below:')
                cleaned_inst = cleaned_inst.replace('🔬 Field Journal Research Log:', '')
                cleaned_inst = cleaned_inst.replace('Lead-in / Warm-up Questions:', '')
                cleaned_inst = cleaned_inst.replace('Deliver your 1-minute presentation or summary', 'Prepare your spoken presentation')
                if cleaned_inst.strip():
                    el['content'] = cleaned_inst.strip()
                    new_elements.append(el)
            else:
                new_elements.append(el)

        slide['elements'] = new_elements

    return data

def main():
    files = sorted(glob.glob('lessons/science-en/*.json'))
    print(f"Refactoring {len(files)} science lessons...")
    count = 0
    for file in files:
        if file.endswith('manifest.json'):
            continue
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        transformed = clean_lesson_data(data)

        with open(file, 'w', encoding='utf-8') as f:
            json.dump(transformed, f, indent=2, ensure_ascii=False)
            f.write('\n')
        count += 1

    print(f"Successfully cleaned and refactored {count} lessons!")

if __name__ == '__main__':
    main()
