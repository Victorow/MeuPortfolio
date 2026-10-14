/** FAQ shown on the classic page and emitted as FAQPage JSON-LD. Text lives in messages under `faq.items.<key>`. */
export type FaqKey = 'who' | 'work' | 'remote' | 'opensource' | 'duo' | 'telegram' | 'contact';

export const FAQ_KEYS: FaqKey[] = ['who', 'work', 'remote', 'opensource', 'duo', 'telegram', 'contact'];
