// ============================================================
// Constants — Character data, event names shared across client
// ============================================================

export const CHARACTER_NAMES: Record<string, string> = {
  dracula: 'Dracula',
  alucard: 'Alucard',
  trickster: 'Trickster',
  van_helsing: 'Van Helsing',
  ghost: 'Ghost',
  boogie_monster: 'Boogie Monster',
  doctor_jekyll: 'Doctor Jekyll',
  swamp_creature: 'Swamp Creature',
  zombie: 'Zombie',
  witch: 'Witch',
};

export const CHARACTER_BACKSTORIES: Record<string, string> = {
  dracula: 'Vị bá tước huyền thoại của bóng đêm. Vừa thức dậy sau hằng thế kỷ và quyết định mở một bữa tiệc khiêu vũ hoành tráng.',
  alucard: 'Con trai của Dracula. Có ngoại hình và khí chất y hệt cha mình, thường che giấu thân phận thật để bảo vệ cha.',
  trickster: 'Kẻ lừa đảo tinh ranh và xảo quyệt. Luôn tự nhận mình là bất cứ ai bị người khác nhắm tới để gây nhiễu loạn.',
  van_helsing: 'Thợ săn ma cà rồng tàn nhẫn. Trà trộn vào bữa tiệc với mục tiêu duy nhất: vạch trần và kết liễu Dracula.',
  ghost: 'Linh hồn lẩn khuất trong lâu đài. Vô hại, thân thiện và luôn sẵn sàng tiết lộ danh tính của mình cho bất kỳ ai muốn biết.',
  boogie_monster: 'Một con quái vật đam mê khiêu vũ. Rất ghét bị từ chối, sẵn sàng nổi cơn thịnh nộ nếu ai đó không chịu nhảy cùng mình.',
  doctor_jekyll: 'Vị tiến sĩ tài ba nhưng bất hạnh. Mang trong mình hai nhân cách trái ngược nhau và có thể hoán đổi thân phận bất cứ lúc nào.',
  swamp_creature: 'Sinh vật bí ẩn ẩn mình dưới lớp bùn lầy. Bản tính nhút nhát, thích sự tĩnh lặng và rất ghét bị mời khiêu vũ.',
  zombie: 'Xác sống chậm chạp nhưng luôn muốn nỗ lực hòa nhập. Thường bị buộc phải tham gia các điệu nhảy dù không cố ý.',
  witch: 'Nữ phù thủy quyền năng thời cổ đại. Sở hữu khả năng thao túng tâm trí, khiến người khác lầm tưởng bà là người mà họ đang tìm kiếm.',
};

export const CHARACTER_ICONS: Record<string, string> = {
  dracula: '🧛',
  alucard: '🦇',
  trickster: '🃏',
  van_helsing: '⚔️',
  ghost: '👻',
  boogie_monster: '👹',
  doctor_jekyll: '🧪',
  swamp_creature: '🐊',
  zombie: '🧟',
  witch: '🧹',
};

export const CHARACTER_IDS = Object.keys(CHARACTER_NAMES);

export const ACTION_NAMES = {
  inquire: 'Check Var',
  dance: 'Rủ Quẩy',
  accuse: 'Bắt Bài',
} as const;
