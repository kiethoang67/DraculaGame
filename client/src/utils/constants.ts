// ============================================================
// Constants — Character data, event names shared across client
// ============================================================

export const CHARACTER_NAMES: Record<string, string> = {
  dracula: 'Bá Tước Mỡ Máu',
  alucard: 'Báo Thủ Ăn Ké',
  trickster: 'Chuyên Gia Phông Bạt',
  van_helsing: 'Thợ Săn Mù Đường',
  ghost: 'Hồn Ma Bú Fame',
  boogie_monster: 'Quái Ế Gầm Giường',
  doctor_jekyll: 'Tiến Sĩ Chập Mạch',
  swamp_creature: 'Mầm Đá Đầm Lầy',
  zombie: 'Thây Ma Lười Biếng',
  witch: 'Phù Thủy Rớt Bằng',
};

export const CHARACTER_BACKSTORIES: Record<string, string> = {
  dracula: 'Vẫn đam mê tiết canh tào phớ nhưng gần đây đi khám bị mỡ máu cao, bác sĩ bắt chuyển sang bú trà kombucha ép cân.',
  alucard: 'Nghề nghiệp chính là "con trai của Dracula". Không có tài cán gì ngoài việc mượn oai bố đi khè thiên hạ và ăn trực.',
  trickster: 'Kỹ năng thì ít nhưng văn vở thì nhiều. Lên mạng mua khóa học làm giàu rồi ra sàn khiêu vũ lùa gà người khác.',
  van_helsing: 'Mua skin xịn chớp nháy nhưng vào trận toàn bấm lộn nút xả skill. Ra đường toàn săn hụt con mồi do mù bản đồ google maps.',
  ghost: 'Mắc chứng sợ bị cho ra rìa. Thấy nhà ai có drama cãi lộn xập xình là hóng hớt, rủ rê cái gì cũng hùa theo cho bằng được.',
  boogie_monster: 'Tướng tá 6 múi cơ bắp thế thôi chứ vừa nhát gan vừa lười bóng chuyền. Cuối tháng gom không đủ tiền trọ đành chui xuống gầm giường trốn chủ nhà.',
  doctor_jekyll: 'Hôm qua đang chế thuốc thì vấp phải dây điện nguồn máy chủ. Từ đó phần cứng lâu lâu bị chập phát sinh ra đa nhân cách lúc này lúc nọ.',
  swamp_creature: 'Ba ngày chưa gội đầu nên luôn tránh xa mấy hoạt động đổ mồ hôi. Ngại giao tiếp xã hội, ai kéo ra nhảy là phản kháng tới cùng.',
  zombie: 'Mua gói tạ gym định tập cardio giảm mỡ, nhưng cứ chạy là bị rớt khớp gối. Cuối cùng chỉ biết lết bộ tà tà làm nền cho team.',
  witch: 'Thông minh sắc sảo nhưng không qua nổi bài thi thực hành bằng lái chổi. Toàn kẹt số de đâm lùi vào biển báo giao thông phường.',
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
