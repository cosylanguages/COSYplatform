import glob
import json
import re
import os

# Specific grammar spotlight details for the 12 lessons that had blockquotes
GRAMMAR_SPOTLIGHTS = {
    "screen-time-kids-8-years-intermediate": {
        "title": "Grammar Spotlight: Present Perfect Continuous vs Past Simple (B1)",
        "content": (
            "Use the Present Perfect Continuous (have/has been + verb-ing) to describe ongoing activities, research, or habits that started in the past and continue into the present.\n"
            "Use the Past Simple (verb-ed / irregular) for completed actions at a definite time in the past.\n"
            "🧩 Interactive Word Bank:\n"
            "Tap a word chip below, then tap any empty bracket [_____] to place it!\n"
            "have been tracking\n"
            "started\n"
            "has been studying\n"
            "found\n"
            "have been observing\n"
            "📝 Task 1 : Part A: Rule Formulation:\n"
            "Complete the rule: Use _____ for actions continuing from the past up to now, and _____ for finished events.\n"
            "📝 Task 1 : Part B: Structured Practice:\n"
            "Scientists _____ children's screen exposure for eight consecutive years.\n"
            "The initial cohort trial _____ back in 2016 in pediatric clinics.\n"
            "Dr. Vance _____ the neurodevelopmental effects since her post-doctoral thesis.\n"
            "Last year, the longitudinal research team _____ an unexpected statistical correlation.\n"
            "Pediatricians _____ screen habits of toddlers across diverse households.\n"
            "Check Answers\n"
            "Reset Board\n"
            "🗣️ Task 2 : Interactive Speaking:\n"
            "How long have you been using your current smartphone or computer daily, and how has that habit evolved?"
        )
    },
    "inside-the-backrooms-intermediate": {
        "title": "Grammar Spotlight: Modals of Deduction & Speculation (B1)",
        "content": (
            "Use modal verbs of deduction to express probability and speculation about mysterious environments.\n"
            "Must be (almost certain it is true), Might/Could be (possible), Can't be (impossible).\n"
            "🧩 Interactive Word Bank:\n"
            "Tap a word chip below, then tap any empty bracket [_____] to place it!\n"
            "must be\n"
            "might be\n"
            "can't be\n"
            "could represent\n"
            "must feel\n"
            "📝 Task 1 : Part A: Rule Formulation:\n"
            "Complete the rule: Use _____ when you are 95% sure something is true. Use _____ when something is completely impossible.\n"
            "📝 Task 1 : Part B: Structured Practice:\n"
            "This infinite maze _____ an endless architectural generation algorithm.\n"
            "It _____ an actual office building because there are no windows or exits anywhere.\n"
            "Wandering through identical fluorescent rooms _____ disorienting for any explorer.\n"
            "The buzzing ambient noise _____ a psychological cue designed to induce anxiety.\n"
            "The liminal space _____ an uncanny manifestation of subconscious memories.\n"
            "Check Answers\n"
            "Reset Board\n"
            "🗣️ Task 2 : Interactive Speaking:\n"
            "Why do liminal spaces like empty airport halls or sterile offices feel eerie? Use modal verbs of deduction."
        )
    },
    "inside-the-backrooms-elementary": {
        "title": "Grammar Spotlight: Comparatives & Sensory Adjectives (A2)",
        "content": (
            "Use comparative forms (adjective + -er / more + adjective + than) and verbs of perception (feel, look, seem) to compare places.\n"
            "🧩 Interactive Word Bank:\n"
            "Tap a word chip below, then tap any empty bracket [_____] to place it!\n"
            "scarier\n"
            "more comfortable\n"
            "stranger\n"
            "quieter\n"
            "feels\n"
            "📝 Task 1 : Part A: Rule Formulation:\n"
            "Complete the rule: Add _____ to short adjectives and use _____ before long adjectives when comparing two places.\n"
            "📝 Task 1 : Part B: Structured Practice:\n"
            "An endless yellow hallway is _____ than a cozy living room.\n"
            "My bedroom looks much _____ than a fluorescent abandoned office.\n"
            "The quietness in the labyrinth _____ mysterious and unsettling.\n"
            "Empty corridors seem _____ at night than during the daytime.\n"
            "Natural forests are _____ than artificial sterile spaces.\n"
            "Check Answers\n"
            "Reset Board\n"
            "🗣️ Task 2 : Interactive Speaking:\n"
            "Compare your favourite room at home with an empty school or office corridor."
        )
    },
    "childhood-obesity-theory-elementary": {
        "title": "Grammar Spotlight: Quantifiers & Countable / Uncountable Nouns (A2)",
        "content": (
            "Use 'much' with uncountable nouns (sugar, fat, water) and 'many' with countable nouns (vegetables, calories, meals).\n"
            "Use 'too much / too many' to indicate an excessive amount.\n"
            "🧩 Interactive Word Bank:\n"
            "Tap a word chip below, then tap any empty bracket [_____] to place it!\n"
            "too much\n"
            "many\n"
            "a lot of\n"
            "much\n"
            "too many\n"
            "📝 Task 1 : Part A: Rule Formulation:\n"
            "Complete the rule: Use _____ with uncountable substances like sugar. Use _____ with plural countable nouns like snacks.\n"
            "📝 Task 1 : Part B: Structured Practice:\n"
            "Drinking _____ sugary soda every day can harm childhood health.\n"
            "Children should eat _____ green vegetables with every meal.\n"
            "Consuming _____ processed snacks leads to rapid weight gain.\n"
            "How _____ water do active children drink throughout the school day?\n"
            "Fresh fruit provides _____ healthy natural vitamins and fiber.\n"
            "Check Answers\n"
            "Reset Board\n"
            "🗣️ Task 2 : Interactive Speaking:\n"
            "What kinds of food and snacks did you enjoy eating when you were a child?"
        )
    },
    "childhood-obesity-theory-intermediate": {
        "title": "Grammar Spotlight: Expressing Causality & Correlation (B1)",
        "content": (
            "Express causal relationships using 'leads to (+ noun/-ing)', 'results in', and 'is caused by'.\n"
            "🧩 Interactive Word Bank:\n"
            "Tap a word chip below, then tap any empty bracket [_____] to place it!\n"
            "leads to\n"
            "results in\n"
            "is caused by\n"
            "contributes to\n"
            "stems from\n"
            "📝 Task 1 : Part A: Rule Formulation:\n"
            "Complete the rule: The phrase 'leads to' is followed by a _____ or a _____, not a base infinitive.\n"
            "📝 Task 1 : Part B: Structured Practice:\n"
            "Frequent consumption of ultra-processed food _____ metabolic imbalance.\n"
            "Childhood sedentary behavior often _____ long-term cardiovascular risks.\n"
            "Early metabolic dysfunction _____ a complex combination of genetic and dietary factors.\n"
            "A lack of structured physical exercise _____ childhood weight struggles.\n"
            "Public health education _____ improved nutritional choices for families.\n"
            "Check Answers\n"
            "Reset Board\n"
            "🗣️ Task 2 : Interactive Speaking:\n"
            "In your opinion, what factors lead to healthy dietary habits in modern communities?"
        )
    },
    "gut-brain-memory-intermediate": {
        "title": "Grammar Spotlight: Second Conditional & Speculative Connections (B1)",
        "content": (
            "Use the Second Conditional (If + Past Simple, would + base verb) to imagine hypothetical biological relationships and outcomes.\n"
            "🧩 Interactive Word Bank:\n"
            "Tap a word chip below, then tap any empty bracket [_____] to place it!\n"
            "improved\n"
            "would experience\n"
            "consumed\n"
            "would boost\n"
            "were\n"
            "📝 Task 1 : Part A: Rule Formulation:\n"
            "Complete the rule: In hypothetical conditional sentences, use _____ in the 'if'-clause and _____ in the result clause.\n"
            "📝 Task 1 : Part B: Structured Practice:\n"
            "If people _____ their gut microbiome diversity, their memory recall _____ noticeably.\n"
            "If you _____ more fermented foods, it _____ beneficial intestinal bacteria.\n"
            "If the gut-brain axis _____ fully decoded, physicians could treat cognitive decline earlier.\n"
            "Patients _____ less brain fog if their intestinal flora remained balanced.\n"
            "If scientists _____ able to map every microbial colony, dietary medicine would transform.\n"
            "Check Answers\n"
            "Reset Board\n"
            "🗣️ Task 2 : Interactive Speaking:\n"
            "If you could redesign your daily diet to optimize your cognitive focus, what would you change?"
        )
    },
    "coffee-fat-muscle-hormones-advanced": {
        "title": "Grammar Spotlight: Subjunctive Mood & Scientific Stance Markers (C1)",
        "content": (
            "In formal academic discourse, use the present subjunctive (base form: that + subject + [base verb]) after adjectives of necessity (imperative, essential, crucial, recommended).\n"
            "🧩 Interactive Word Bank:\n"
            "Tap a word chip below, then tap any empty bracket [_____] to place it!\n"
            "account\n"
            "remain\n"
            "be monitored\n"
            "maintain\n"
            "undergo\n"
            "📝 Task 1 : Part A: Rule Formulation:\n"
            "Complete the rule: Following phrases like 'It is imperative that...', the subsequent verb must appear in the _____ form regardless of person or tense.\n"
            "📝 Task 1 : Part B: Structured Practice:\n"
            "It is imperative that researchers _____ for baseline cortisol levels when evaluating caffeine.\n"
            "Sports nutritionists recommend that an athlete's endocrine response _____ regularly.\n"
            "It is crucial that participants _____ a standardized fasting period before trials.\n"
            "We propose that each cohort _____ consistent training volume throughout the study.\n"
            "It is vital that hormonal biomarkers _____ stable during the endurance evaluation.\n"
            "Check Answers\n"
            "Reset Board\n"
            "🗣️ Task 2 : Interactive Speaking:\n"
            "Present your scientific perspective on whether high caffeine intake benefits or undermines athletic recovery."
        )
    },
    "human-family-tree-rewrite-advanced": {
        "title": "Grammar Spotlight: Negative Inversion & Emphatic Fronting (C1)",
        "content": (
            "Use negative inversion (Negative adverbial + auxiliary + subject + main verb) to emphasize surprising historical and genetic milestones.\n"
            "Common triggers: Not until..., Seldom have..., Only recently did..., Under no circumstances...\n"
            "🧩 Interactive Word Bank:\n"
            "Tap a word chip below, then tap any empty bracket [_____] to place it!\n"
            "did scientists realize\n"
            "have anthropologists uncovered\n"
            "did we comprehend\n"
            "has fossil evidence revealed\n"
            "did researchers confirm\n"
            "📝 Task 1 : Part A: Rule Formulation:\n"
            "Complete the rule: When a sentence begins with a negative or restrictive adverbial, the subject and the _____ invert.\n"
            "📝 Task 1 : Part B: Structured Practice:\n"
            "Not until ancient DNA sequencing took place _____ how frequent archaic interbreeding was.\n"
            "Rarely _____ such well-preserved Denisovan remains in Siberian caves.\n"
            "Only recently _____ the full genealogical complexity of early Homo sapiens.\n"
            "Seldom _____ such dramatic revisions to our understanding of human origin lineages.\n"
            "Not until multi-locus analyses were published _____ Neanderthal genetic persistence in modern populations.\n"
            "Check Answers\n"
            "Reset Board\n"
            "🗣️ Task 2 : Interactive Speaking:\n"
            "Discuss how new genomic discoveries transform the narrative of human evolution."
        )
    },
    "multilingual-younger-brains-intermediate": {
        "title": "Grammar Spotlight: Linking Devices for Complex Cause & Consequence (B1)",
        "content": (
            "Connect related scientific arguments using cause-and-effect linkers: 'due to (+ noun)', 'as a consequence of', 'consequently', and 'thereby (+ -ing)'.\n"
            "🧩 Interactive Word Bank:\n"
            "Tap a word chip below, then tap any empty bracket [_____] to place it!\n"
            "Due to\n"
            "Consequently\n"
            "thereby\n"
            "As a result of\n"
            "therefore\n"
            "📝 Task 1 : Part A: Rule Formulation:\n"
            "Complete the rule: 'Due to' is followed by a _____ phrase, whereas 'consequently' introduces an independent clause.\n"
            "📝 Task 1 : Part B: Structured Practice:\n"
            "_____ continual linguistic conflict resolution, bilingual brains develop robust executive control.\n"
            "Polyglots engage distinct neural networks; _____, symptoms of cognitive impairment manifest later.\n"
            "Active language practice stimulates neural plasticity, _____ preserving grey matter density.\n"
            "_____ early immersive bilingual education, children demonstrate heightened attention flexibility.\n"
            "Older multilingual adults maintain richer synaptic reserve; _____, their mental agility persists longer.\n"
            "Check Answers\n"
            "Reset Board\n"
            "🗣️ Task 2 : Interactive Speaking:\n"
            "How does learning a foreign language challenge your cognitive focus and problem-solving abilities?"
        )
    },
    "multilingual-younger-brains-elementary": {
        "title": "Grammar Spotlight: Present Simple for Universal Truths & Abilities (A2)",
        "content": (
            "Use the Present Simple (verb / verb + -s) to state scientific facts, routines, and permanent abilities.\n"
            "Remember third-person singular agreement (he/she/it + -s/es).\n"
            "🧩 Interactive Word Bank:\n"
            "Tap a word chip below, then tap any empty bracket [_____] to place it!\n"
            "keeps\n"
            "switches\n"
            "exercises\n"
            "protects\n"
            "learn\n"
            "📝 Task 1 : Part A: Rule Formulation:\n"
            "Complete the rule: For third-person singular subjects (it / the brain), add _____ to the base verb in Present Simple.\n"
            "📝 Task 1 : Part B: Structured Practice:\n"
            "Language learning _____ the brain agile and resilient.\n"
            "A multilingual person _____ between languages effortlessly.\n"
            "Bilingual communication _____ multiple cognitive regions at once.\n"
            "Active mental stimulation _____ against premature cognitive decline.\n"
            "Children _____ new vocabulary items through active conversation and play.\n"
            "Check Answers\n"
            "Reset Board\n"
            "🗣️ Task 2 : Interactive Speaking:\n"
            "How often do you practice speaking English or other languages every week?"
        )
    },
    "recycling-distraction-test-intermediate": {
        "title": "Grammar Spotlight: Concession & Contrast Connectors (B1)",
        "content": (
            "Express contrasts between individual actions and systemic realities using 'although', 'whereas', 'despite (+ noun/-ing)', and 'nevertheless'.\n"
            "🧩 Interactive Word Bank:\n"
            "Tap a word chip below, then tap any empty bracket [_____] to place it!\n"
            "Although\n"
            "despite\n"
            "whereas\n"
            "Nevertheless\n"
            "In spite of\n"
            "📝 Task 1 : Part A: Rule Formulation:\n"
            "Complete the rule: 'Although' is followed by a full subject-verb clause, while 'despite' is followed by a _____ or _____-form.\n"
            "📝 Task 1 : Part B: Structured Practice:\n"
            "_____ many households sort plastic diligently, municipal recycling capacity remains limited.\n"
            "Consumers feel ethical satisfaction _____ widespread corporate packaging waste.\n"
            "Individual habits matter, _____ industrial decarbonization requires nationwide policy changes.\n"
            "Carbon emissions climbed last quarter. _____, civic awareness of climate impact is higher than ever.\n"
            "_____ good environmental intentions, single-use containers frequently end up in landfills.\n"
            "Check Answers\n"
            "Reset Board\n"
            "🗣️ Task 2 : Interactive Speaking:\n"
            "Do you believe individual recycling efforts truly help the planet, or should policies focus on big corporations?"
        )
    },
    "tv-midlife-shrink-brain-intermediate": {
        "title": "Grammar Spotlight: Gerunds vs Infinitives for Daily Habits (B1)",
        "content": (
            "Use gerunds (-ing) after prepositions and verbs of enjoyment/routine (enjoy, avoid, spend time). Use infinitives (to + verb) after decisions and goals (decide, plan, hope).\n"
            "🧩 Interactive Word Bank:\n"
            "Tap a word chip below, then tap any empty bracket [_____] to place it!\n"
            "watching\n"
            "to limit\n"
            "engaging\n"
            "to protect\n"
            "exercising\n"
            "📝 Task 1 : Part A: Rule Formulation:\n"
            "Complete the rule: After the phrase 'leads to' or prepositions like 'by', use a _____. After 'decide' or 'aim', use an _____.\n"
            "📝 Task 1 : Part B: Structured Practice:\n"
            "Spending several hours _____ passive television shows daily reduces cognitive stimulation.\n"
            "Many middle-aged professionals decide _____ their screen time after reading this research.\n"
            "Scientists recommend _____ in mentally stimulating hobbies like chess or reading.\n"
            "They initiated a walking group _____ their long-term neurological health.\n"
            "People can improve neuroplasticity by _____ regularly and socializing.\n"
            "Check Answers\n"
            "Reset Board\n"
            "🗣️ Task 2 : Interactive Speaking:\n"
            "What activities do you enjoy doing to unwind that also keep your mind sharp?"
        )
    }
}

# Error correction pairs for the 5 lessons missing error-correction
ERROR_CORRECTIONS = {
    "screen-time-kids-8-years-intermediate": [
        {
            "incorrect": "Scientists are tracking the kids since eight years.",
            "correct": "Scientists have been tracking the kids for eight years.",
            "note": "Use Present Perfect Continuous with 'for' to describe continuous duration up to now."
        },
        {
            "incorrect": "Too much screen time make children tired.",
            "correct": "Too much screen time makes children tired.",
            "note": "Uncountable noun phrase 'too much screen time' requires a singular verb."
        }
    ],
    "coffee-fat-muscle-hormones-advanced": [
        {
            "incorrect": "It is essential that an athlete drinks water immediately.",
            "correct": "It is essential that an athlete drink water immediately.",
            "note": "Subjunctive mood: use base verb 'drink' in that-clauses after 'essential'."
        },
        {
            "incorrect": "Caffeine increases the heart rate according of the dose.",
            "correct": "Caffeine increases the heart rate according to the dose.",
            "note": "Fixed preposition: 'according to', never 'according of'."
        }
    ],
    "human-family-tree-rewrite-advanced": [
        {
            "incorrect": "Seldom scientists have discovered such intact genetic samples.",
            "correct": "Seldom have scientists discovered such intact genetic samples.",
            "note": "Negative inversion: auxiliary 'have' precedes the subject 'scientists'."
        },
        {
            "incorrect": "We discussed about the hominin migration routes.",
            "correct": "We discussed the hominin migration routes.",
            "note": "Transitive verb: do not use the preposition 'about' after 'discuss'."
        }
    ],
    "multilingual-younger-brains-intermediate": [
        {
            "incorrect": "Due to he speaks two languages, his brain is active.",
            "correct": "Because he speaks two languages / Due to speaking two languages, his brain is active.",
            "note": "'Due to' must be followed by a noun or gerund, not a full subject-verb clause."
        },
        {
            "incorrect": "Learning words keep the hippocampus healthy.",
            "correct": "Learning words keeps the hippocampus healthy.",
            "note": "A gerund subject ('learning') is grammatically singular and takes 'keeps'."
        }
    ],
    "multilingual-younger-brains-elementary": [
        {
            "incorrect": "Bilingual people switches languages very fast.",
            "correct": "Bilingual people switch languages very fast.",
            "note": "Plural subject 'people' takes the base verb 'switch' without -s."
        },
        {
            "incorrect": "I am practice English every morning.",
            "correct": "I practice English every morning.",
            "note": "Routine actions take the Present Simple ('practice'), not am + base verb."
        }
    ]
}

def clean_and_standardize_lesson(fpath, data):
    lesson_key = os.path.basename(fpath).replace('.json', '')
    slides = data.get('slides', [])
    data['templateType'] = 'interactive_lesson'

    # Check which slides we currently have
    slide_dict = {}
    for s in slides:
        slide_dict[s.get('title')] = s

    # Ensure Slide 1: Lead-in & Topic Discovery
    s1 = slide_dict.get('Lead-in & Topic Discovery')
    if not s1 and len(slides) > 0:
        s1 = slides[0]
        s1['title'] = "Lead-in & Topic Discovery"
        s1['stage'] = "Warm-up & Context"

    # Ensure Slide 2: Core Vocabulary & Collocations
    s2 = slide_dict.get('Core Vocabulary & Collocations')
    if not s2 and len(slides) > 1:
        s2 = slides[1]
        s2['title'] = "Core Vocabulary & Collocations"
        s2['stage'] = "Vocabulary Discovery"

    # Ensure Slide 3: Language Focus & Grammar Spotlight
    s3 = slide_dict.get('Language Focus & Grammar Spotlight')
    if not s3 and len(slides) > 2:
        s3 = slides[2]
        s3['title'] = "Language Focus & Grammar Spotlight"
        s3['stage'] = "Grammar & Patterns"

    # Ensure s3 has structured grammar-spotlight element
    if s3:
        has_gs = any(el.get('type') == 'grammar-spotlight' for el in s3.get('elements', []))
        if not has_gs:
            # Check if we have specific spotlight definition
            spotlight_data = GRAMMAR_SPOTLIGHTS.get(lesson_key)
            if spotlight_data:
                s3['elements'] = [
                    {
                        "type": "instruction",
                        "content": "Master the key grammatical structures and discourse patterns below:"
                    },
                    {
                        "type": "grammar-spotlight",
                        "title": spotlight_data["title"],
                        "content": spotlight_data["content"]
                    }
                ]
            else:
                # Find blockquote if any
                bqs = [el.get('content') for el in s3.get('elements', []) if el.get('type') == 'blockquote']
                bq_content = bqs[0] if bqs else "Focus on core scientific sentence structures and reporting patterns."
                s3['elements'] = [
                    {
                        "type": "instruction",
                        "content": "Master the key grammatical structures and discourse patterns below:"
                    },
                    {
                        "type": "grammar-spotlight",
                        "title": f"Grammar Spotlight ({data.get('level', 'Intermediate')})",
                        "content": bq_content
                    }
                ]

    # Ensure Slide 4: Reading Insight & Comprehension
    s4 = slide_dict.get('Reading Insight & Comprehension')
    if not s4 and len(slides) > 3:
        s4 = slides[3]
        s4['title'] = "Reading Insight & Comprehension"
        s4['stage'] = "Reading & Discovery"

    # Ensure Slide 5: Deep Dive & Critical Analysis
    s5 = slide_dict.get('Deep Dive & Critical Analysis')
    if not s5:
        # Create standard Deep Dive slide
        clean_title = data.get('title', 'Scientific Breakthrough').replace('Keeping Up with Science: ', '')
        s5 = {
            "id": "slide-5",
            "title": "Deep Dive & Critical Analysis",
            "stage": "Critical Analysis",
            "elements": [
                {
                    "type": "instruction",
                    "content": "Work with your partner to critically analyze the mechanisms, implications, and controversies of this research:"
                },
                {
                    "type": "blockquote",
                    "content": f"Critical Scenario & Analytical Challenge:\nEvaluate the real-world applications of: \"{clean_title}\". Consider potential secondary consequences, ethical challenges, and whether mainstream media interpretations accurately reflect the empirical science."
                },
                {
                    "type": "instruction",
                    "content": "Synthesize your analysis and prepare key arguments:"
                },
                {
                    "type": "essay",
                    "placeholder": "Draft your critical perspectives and evidence points here..."
                }
            ]
        }

    # Ensure Slide 6: Collaborative Discussion & Perspectives
    s6 = slide_dict.get('Collaborative Discussion & Perspectives')
    if not s6:
        clean_title = data.get('title', 'Scientific Breakthrough').replace('Keeping Up with Science: ', '')
        s6 = {
            "id": "slide-6",
            "title": "Collaborative Discussion & Perspectives",
            "stage": "Interactive Discussion",
            "elements": [
                {
                    "type": "instruction",
                    "content": "Explore broader perspectives, future societal impacts, and ethical considerations:"
                },
                {
                    "type": "discussion-prompts",
                    "prompts": [
                        f"How do these findings regarding {clean_title.lower()} challenge common public assumptions?",
                        "If you had the opportunity to interview the lead researchers, which unresolved question would you ask?",
                        "What policies or practical guidelines should organizations implement based on this empirical evidence?"
                    ]
                },
                {
                    "type": "essay",
                    "placeholder": "Reflect on these questions and write down your arguments..."
                }
            ]
        }

    # Ensure Slide 7: Guided Speaking & Production Task
    s7 = slide_dict.get('Guided Speaking & Production Task')
    if not s7:
        clean_title = data.get('title', 'Scientific Breakthrough').replace('Keeping Up with Science: ', '')
        s7 = {
            "id": "slide-7",
            "title": "Guided Speaking & Production Task",
            "stage": "Speaking & Production",
            "elements": [
                {
                    "type": "instruction",
                    "content": "Prepare a clear 2-minute spoken summary or personal pitch based on the scenario below:"
                },
                {
                    "type": "blockquote",
                    "content": f"Spoken Presentation Task:\nYou are presenting a lightning briefing to an interdisciplinary scientific panel. Summarize the core findings on \"{clean_title}\", explain why it matters to society, and propose the next vital step in this domain."
                },
                {
                    "type": "instruction",
                    "content": "Structure your pitch using target vocabulary and newly studied grammar structures:"
                },
                {
                    "type": "essay",
                    "placeholder": "Write your speaking outline, bullet points, and key discourse markers..."
                }
            ]
        }

    # Ensure Slide 8: Language Reflection & Feedback
    s8 = slide_dict.get('Language Reflection & Feedback')
    if not s8:
        s8 = slides[-1] if len(slides) >= 5 else None
    if s8:
        s8['title'] = "Language Reflection & Feedback"
        s8['stage'] = "Wrap-up & Feedback"
        # Ensure s8 has error-correction element
        has_ec = any(el.get('type') == 'error-correction' for el in s8.get('elements', []))
        if not has_ec:
            ec_pairs = ERROR_CORRECTIONS.get(lesson_key, [
                {
                    "incorrect": "We discussed about the research yesterday.",
                    "correct": "We discussed the research yesterday.",
                    "note": "'Discuss' is a transitive verb; do not use 'about'."
                },
                {
                    "incorrect": "The scientists made a great progress.",
                    "correct": "The scientists made great progress.",
                    "note": "'Progress' is an uncountable noun; do not use the article 'a'."
                }
            ])
            s8['elements'] = [
                {
                    "type": "instruction",
                    "content": "Examine common linguistic pitfalls and refine your accuracy with teacher guidance:"
                },
                {
                    "type": "error-correction",
                    "pairs": ec_pairs
                },
                {
                    "type": "instruction",
                    "content": "Teacher's real-time personalized feedback, pronunciation notes, and target goals:"
                },
                {
                    "type": "essay",
                    "placeholder": "Record your personal language takeaways, error corrections, and goals for the next session..."
                }
            ]

    # Reassemble complete 8-slide standardized curriculum sequence
    standard_slides = [s1, s2, s3, s4, s5, s6, s7, s8]
    for idx, slide in enumerate(standard_slides, start=1):
        slide['id'] = f"slide-{idx}"

    data['slides'] = standard_slides
    data['durationMinutes'] = 60
    return data

def main():
    files = sorted(glob.glob('lessons/science-en/*.json'))
    print(f"Standardizing {len(files)} science lessons...")
    count = 0
    for file in files:
        if file.endswith('manifest.json'):
            continue
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        transformed = clean_and_standardize_lesson(file, data)

        with open(file, 'w', encoding='utf-8') as f:
            json.dump(transformed, f, indent=2, ensure_ascii=False)
            f.write('\n')
        count += 1

    print(f"Successfully cleaned, standardized, and enriched all {count} science lessons to 8 comprehensive stages!")

if __name__ == '__main__':
    main()
