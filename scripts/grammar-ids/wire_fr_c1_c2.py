"""Wire French C1/C2 lessons to the COSYmanuals topic pages.

Adds `grammarIds` to every lesson of curriculums/fr/<track>/C1.json and C2.json, resolving each
segment of the free-text `grammar` field to a same-level manual page.
"""
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fr_c1_c2_rules import lookup
from fr_c1_c2_index import pages, score, stems

REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
LEVEL_SYNTHESIS = {
    'c1': 'examen-de-synthese-c1-de-toutes-les-structures-orales-rhetoriques-diplomatiques-et-academiques',
    'c2': 'synthese-et-evaluation-de-la-maitrise-de-la-grammaire-c2-poetique-rhetorique-hermeneutique-jurisprudence-et-macro-finance',
}

# segments whose best lexical match is weak or misleading, resolved by hand
OVERRIDES = {
    'c1': {
        'Subjonctif imparfait et plus-que-parfait': 'concordance-des-temps-complexes-a-lindicatif-et-au-subjonctif',
        'Concession, restriction et nuance': 'conjonctions-de-concession-et-de-synthese',
        'Concession': 'conjonctions-de-concession-et-de-synthese',
        'Concession avancée': 'concessions-conditionnelles-assorties-de-reserves',
        'Concession et nuance': 'conjonctions-de-concession-et-de-synthese',
        'Concession avec encore que': 'conjonctions-de-concession-et-de-synthese',
        'Lexique abstrait et polysémie': 'registre-lexico-syntaxique-eleve-du-discours-dentreprise',
        'Figures de style et rhétorique': 'procedes-oratoires-anaphore-gradation-question-rhetorique',
        'Cohésion textuelle et reprises anaphoriques': 'structuration-syntaxique-spontanee-et-chaines-de-cohesion',
        'Formats d\'examen': 'examen-de-synthese-c1-de-toutes-les-structures-orales-rhetoriques-diplomatiques-et-academiques',
        'Adjectivation antéposée': 'inversion-du-sujet-et-anteposition-de-ladjectif-ou-du-participe',
        'Adjectifs et participes substantivés': 'inversion-du-sujet-et-anteposition-de-ladjectif-ou-du-participe',
        'Hypothèse avec subjonctif (à supposer que + subjonctif)': 'propositions-conditionnelles-et-hypothetiques-complexes-quand-bien-meme-si-tant-est-que',
        'Conditionnelles à protase implicite': 'propositions-conditionnelles-et-hypothetiques-complexes-quand-bien-meme-si-tant-est-que',
        'Conditionnelles à protase réduite': 'propositions-conditionnelles-et-hypothetiques-complexes-quand-bien-meme-si-tant-est-que',
        'Litote, euphémisme et atténuation': 'locutions-euphemiques-et-modales-il-serait-pour-le-moins-premature-de-on-pourrait-suggerer',
        'Conditionnel de politesse': 'subjonctif-et-conditionnel-de-courtoisie',
        'Conditionnel journalistique et modalisateurs de probabilité': 'conditionnel-de-reserve-dans-les-debats',
        'Conditionnel irréel de distanciation': 'conditionnel-de-reserve-dans-les-debats',
        'Formules de recherche de consensus': 'constructions-de-conduite-des-debats-de-haute-direction',
        'Collocations et registre': 'adverbes-modificateurs-de-registre',
        'Liaisons facultatives utilisées dans le style élevé, théâtral et politique': 'gestion-du-tempo-et-des-pauses-du-style-oratoire-eleve',
    },
    'c2': {
        'Style soutenu et précision lexicale': 'style-litteraire-et-publicistique-combine-a-la-profondeur-analytique',
        'Syntaxe de la phrase longue et de la période': 'cadence-litteraire-et-polyphonie-de-la-phrase-francaise',
        'Reformulation, synthèse et intertextualité': 'propositions-de-reformulations-tactiques-cela-donne-limpression-que-on-pourrait-en-deduire',
        'Prononciation des latinismes et emprunts étrangers conservés en français': 'variations-phonologiques-et-morphosyntaxiques-des-dialectes-du-francais-mondial',
        'Maîtrise des registres et des niveaux de langue': 'transformations-de-registres-syntaxiques-complexes-a-travers-6-niveaux-de-langue',
        'Implicite, présupposés et sous-entendus': 'chutes-dintonation-de-sous-texte-et-propositions-implicites',
        'Ironie, distance critique et point de vue': 'inversion-subversive-et-propositions-teintees-dironie',
    },
}

MIN_SCORE = 6.5
SECOND_SCORE = 3.0


def seg_pick(lvl, seg):
    if seg in OVERRIDES[lvl]:
        return OVERRIDES[lvl][seg]
    rule = lookup(lvl, seg)
    if rule:
        return rule[0]
    ls = stems(seg)
    ranked = sorted(pages[lvl], key=lambda p: -score(ls, p, lvl))
    if ranked and score(ls, ranked[0], lvl) >= MIN_SCORE:
        return ranked[0]['slug']
    return None


NO_GRAMMAR = {
    ('general', 'c2', 1): ['transformations-de-registres-syntaxiques-complexes-a-travers-6-niveaux-de-langue',
                           'alternance-de-registres-et-maitrise-des-figures-rhetoriques-dans-les-discours-de-direction'],
    ('general', 'c2', 2): ['maitrise-de-la-triade-rhetorique-ethos-pathos-logos',
                           'structure-de-la-peroraison-spontanee-exorde-these-escalade-climax-chute'],
    ('general', 'c2', 3): ['subjonctif-imparfait-et-plus-que-parfait-du-subjonctif-dans-le-style-litteraire-et-philosophique',
                           'synthese-de-la-modalite-epistemique-de-la-syntaxe-socratique-et-de-lanteposition-macroeconomique'],
    ('general', 'c2', 4): ['maitrise-de-lanalyse-institutionnelle-et-des-rapports',
                           'valorisation-de-lexperience-dadministration'],
    ('general', 'c2', 5): ['style-officiel-et-juridique-eleve',
                           'syntaxe-juridique-et-administrative-adverbes-archaiques-et-prepositions-complexes-ci-apres-nonobstant-es-qualites'],
    ('general', 'c2', 6): ['propositions-dallusions-litteraires-et-de-reminiscence-dans-le-monologue-oral',
                           'propositions-parenthetiques-dauteur-et-substitution-lexicale'],
    ('general', 'c2', 7): ['nuances-semantiques-selon-la-position-de-ladjectif-epithete-antepose-vs-postpose',
                           'adverbes-modificateurs-de-details-sensoriels'],
    ('general', 'c2', 8): ['inversion-conditionnelle-dans-les-previsions-macroeconomiques-appliquerions-nous-ce-modele-nous-obtiendrions',
                           'reseaux-syntaxiques-hypothetiques-complexes-des-accords-multilateraux'],
    ('general', 'c2', 9): ['constructions-infinitives-dans-les-codes-dethique',
                           'cadence-reflexive-et-deliberative'],
    ('general', 'c2', 13): ['syntaxe-juridique-et-administrative-adverbes-archaiques-et-prepositions-complexes-ci-apres-nonobstant-es-qualites',
                            'style-solennel-et-ceremonial'],
}


def resolve(lvl, grammar):
    segs = [s.strip() for s in grammar.split('|') if s.strip()]
    ids = []
    for seg in segs:
        pick = seg_pick(lvl, seg)
        if pick and pick not in ids:
            ids.append(pick)
        if len(ids) == 2:
            return ids
    for seg in segs:
        if len(ids) == 2:
            break
        rule = lookup(lvl, seg)
        if rule:
            for slug in rule:
                if slug not in ids:
                    ids.append(slug)
                    break
            continue
        ls = stems(seg)
        for p in sorted(pages[lvl], key=lambda p: -score(ls, p, lvl))[:6]:
            if p['slug'] not in ids and score(ls, p, lvl) >= SECOND_SCORE:
                ids.append(p['slug'])
                break
    if len(ids) < 2:
        ids.append(LEVEL_SYNTHESIS[lvl])
    return ids[:2]


def main(write=False):
    valid = {lvl: {p['slug'] for p in v} for lvl, v in pages.items()}
    report = []
    for path in sorted(glob.glob(f'{REPO}/curriculums/fr/*/C*.json')):
        data = json.load(open(path, encoding='utf-8'))
        lvl = data['level'].lower()
        track = path.split('/')[-2]
        changed = 0
        for unit in data['units']:
            for les in unit['lessons']:
                g = les.get('grammar')
                if isinstance(g, list):
                    g = ' | '.join(g)
                if not g:
                    key = (track, lvl, unit['unit'])
                    ids = NO_GRAMMAR.get(key)
                    if not ids:
                        report.append((track, lvl, les['lesson'], 'NONE', []))
                        continue
                else:
                    ids = resolve(lvl, g)
                for i in ids:
                    assert i in valid[lvl], f'{lvl}: unknown slug {i}'
                if les.get('grammarIds') != ids:
                    changed += 1
                new = {}
                for k, v in les.items():
                    if k == 'grammarIds':
                        continue
                    new[k] = v
                    if k == 'grammar':
                        new['grammarIds'] = [f'fr-{lvl}-{i}' for i in ids]
                if 'grammarIds' not in new:
                    new['grammarIds'] = [f'fr-{lvl}-{i}' for i in ids]
                les.clear()
                les.update(new)
                report.append((track, lvl, les['lesson'], g, ids))
        if write:
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        print(f'{path.split("fr/")[1]:24} lessons updated: {changed}')
    print(f'\ntotal lessons: {len(report)}')
    if not write:
        import collections
        dup = collections.Counter(i for *_, ids in report for i in ids)
        print('most reused pages:')
        for slug, n in dup.most_common(5):
            print(f'   {n:>3} {slug}')
    return report


if __name__ == '__main__':
    main(write='--write' in sys.argv)
