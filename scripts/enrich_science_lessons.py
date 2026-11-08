import glob
import json
import re
import os

def parse_vocab_blockquote(content):
    """Parses a vocabulary blockquote into structured vocab items."""
    # Matches bullet items like: • Word: definition\n   Example: "sentence"
    items = []
    # Split by bullets
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

            # Check if there is an explanatory note in parentheses at the end
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

def transform_lesson_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    slides = data.get('slides', [])
    modified = False

    for slide in slides:
        stage = slide.get('stage', '')
        elements = slide.get('elements', [])
        new_elements = []

        for i, el in enumerate(elements):
            el_type = el.get('type')
            content = el.get('content', '')

            if el_type == 'blockquote':
                trimmed = content.strip()
                # 1. Error correction block
                if '❌' in trimmed and '➔' in trimmed:
                    pairs = parse_correction_blockquote(trimmed)
                    if pairs:
                        new_elements.append({
                            "type": "error-correction",
                            "pairs": pairs
                        })
                        modified = True
                        continue

                # 2. Vocabulary item block
                if trimmed.startswith('•') and ('Example:' in trimmed or 'example:' in trimmed):
                    vocab_items = parse_vocab_blockquote(trimmed)
                    if vocab_items:
                        # Check if preceding element was vocab-cards to merge them
                        if new_elements and new_elements[-1].get('type') == 'vocab-cards':
                            new_elements[-1]['items'].extend(vocab_items)
                        else:
                            new_elements.append({
                                "type": "vocab-cards",
                                "items": vocab_items
                            })
                        modified = True
                        continue

                # 3. Grammar explanation
                if trimmed.startswith('⚡') or 'grammar explanation' in trimmed.lower():
                    title = "Language Focus"
                    lines = trimmed.split('\n')
                    if lines and ('grammar explanation' in lines[0].lower() or '⚡' in lines[0]):
                        title = lines[0].replace('⚡', '').strip()
                        body = '\n'.join(lines[1:]).strip()
                    else:
                        body = trimmed
                    new_elements.append({
                        "type": "grammar-spotlight",
                        "title": title,
                        "content": body
                    })
                    modified = True
                    continue

                # 4. Headline task
                if 'Imagine researchers publish a breaking science story' in trimmed or 'Complete the headline' in trimmed.lower():
                    # Check next element or previous
                    headline_text = trimmed
                    new_elements.append({
                        "type": "headline-builder",
                        "prompt": "Complete the Breaking Science Headline:",
                        "headline": headline_text
                    })
                    modified = True
                    continue

                # 5. Multi-prompt discussion in Fluency or Debate stages
                if trimmed.startswith('•') and stage in ['Fluency Practice', 'Debate & Future Outlook', 'Deep Analysis']:
                    prompts = parse_discussion_blockquote(trimmed)
                    if prompts:
                        new_elements.append({
                            "type": "discussion-prompts",
                            "prompts": prompts
                        })
                        modified = True
                        continue

            new_elements.append(el)

        slide['elements'] = new_elements

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')
    return modified

def main():
    files = sorted(glob.glob('lessons/science-en/*.json'))
    print(f"Transforming {len(files)} science lessons...")
    count = 0
    for file in files:
        if file.endswith('manifest.json'):
            continue
        if transform_lesson_file(file):
            count += 1
    print(f"Successfully transformed {count} lessons to rich constructor element format!")

if __name__ == '__main__':
    main()
