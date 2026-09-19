const HOBBY_ICONS: Record<string, string> = {
  guitar: '🎸',
  piano: '🎹',
  painting: '🎨',
  'watercolor painting': '🎨',
  drawing: '✏️',
  writing: '✍️',
  'creative writing': '✍️',
  chess: '♟️',
  coding: '💻',
  programming: '💻',
  cooking: '🍳',
  baking: '🧁',
  photography: '📷',
  dance: '💃',
  singing: '🎤',
  yoga: '🧘',
  running: '🏃',
  fitness: '🏋️',
};

export function getHobbyIcon(hobby: string): string {
  return HOBBY_ICONS[hobby.trim().toLowerCase()] ?? '📘';
}
