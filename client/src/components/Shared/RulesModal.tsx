import { useGameStore } from '../../stores/useGameStore';

export function RulesModal() {
  const { isRulesOpen, toggleRules } = useGameStore();

  if (!isRulesOpen) return null;

  return (
    <div className="modal-overlay" onClick={toggleRules} style={{ zIndex: 9999 }}>
      <div 
        className="modal game-rules-modal" 
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '800px',
          width: '90%',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: 'var(--space-xl)',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-blood-glow)', textShadow: '0 0 15px rgba(255, 23, 68, 0.5)' }}>
            📜 Luật Chơi Dracula's Feast
          </h2>
          <button className="btn btn--secondary" onClick={toggleRules}>✕ Đóng</button>
        </div>

        <div className="rules-content" style={{ lineHeight: '1.8' }}>
          <h3 style={{ color: 'var(--color-gold-bright)', marginTop: 'var(--space-lg)' }}>1. 🦇 Tổng quan trò chơi</h3>
          <ul>
            <li><strong>Thể loại:</strong> Ẩn vai (Hidden Roles), Suy luận, Party Game.</li>
            <li><strong>Số lượng:</strong> 4 - 8 người chơi.</li>
            <li><strong>Điểm đặc biệt:</strong> Không ai bị loại sớm, chơi nhanh gọn. Kể cả khi bị lật vai, bạn vẫn tiếp tục được chơi.</li>
            <li><strong>Mục tiêu:</strong> Trở thành người đầu tiên <strong>"Buộc tội"</strong> (đoán) chính xác danh tính của tất cả các người chơi khác (những người chưa lật bài).</li>
          </ul>

          <h3 style={{ color: 'var(--color-gold-bright)', marginTop: 'var(--space-lg)' }}>2. 🃏 Thành phần trò chơi</h3>
          <ul>
            <li><strong>Thẻ Khách (Guest)</strong>: Các vai trò bí mật trong bữa tiệc.</li>
            <li><strong>Thẻ Thì Thầm (Whisper Cards)</strong>: Gồm "Yes" và "No" để trả lời bí mật.</li>
            <li><strong>Thẻ Buộc Tội</strong>: Dùng để dự đoán vai của đối thủ.</li>
          </ul>

          <h3 style={{ color: 'var(--color-gold-bright)', marginTop: 'var(--space-lg)' }}>3. ⚙️ Chuẩn bị (Setup)</h3>
          <ul>
            <li>Luôn luôn có Dracula tham gia.</li>
            <li>Mỗi người được giữ 1 thẻ vai trò bí mật được chia ngẫu nhiên.</li>
            <li>Có 1 thẻ <strong>Khách Ẩn (Mystery Guest)</strong> được úp giữa bàn, đây là vai không ai giữ (Dracula không bao giờ là Khách Ẩn).</li>
            <li>Mỗi người đều có 1 nút "Thì thầm" <strong>Yes</strong> hoặc <strong>No</strong> để trả lời.</li>
          </ul>

          <h3 style={{ color: 'var(--color-gold-bright)', marginTop: 'var(--space-lg)' }}>4. 🍷 Cách chơi (Action Giai đoạn tiến hành)</h3>
          <p>Chơi lần lượt theo chiều kim đồng hồ. Dưới khay chức năng của mình, bạn <strong>bắt buộc</strong> phải chọn 1 trong 3 hành động:</p>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)' }}>
            <h4 style={{ color: 'var(--text-primary)' }}>❓ 1. Hỏi (Inquire)</h4>
            <p>Bạn chọn 1 người và hỏi họ: <em>"Bạn có phải là [Nhân vật] không?"</em></p>
            <ul>
              <li>Người bị hỏi phải bí mật đưa Thẻ Thì Thầm cho bạn: <strong>"Yes"</strong> (nếu đúng) hoặc <strong>"No"</strong> (nếu sai).</li>
              <li><strong>Quy tắc:</strong> Mọi người mặc định KIẾN QUYẾT phải nói thật! (Trừ khi nhân vật của họ có năng lực đặc thù như <strong>Trickster</strong> luôn đưa Yes).</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)' }}>
            <h4 style={{ color: 'var(--text-primary)' }}>💃 2. Khiêu vũ (Dance)</h4>
            <p>Bạn ngỏ lời mời 1 người <strong>Khiêu vũ</strong>.</p>
            <ul>
              <li><strong>Chấp nhận:</strong> Hai người sẽ bí mật cho nhau xem thẻ vai trò của mình.</li>
              <li><strong>Từ chối:</strong> Bạn không được khiêu vũ nữa, lúc này bạn BẮT BUỘC phải chuyển sang hành động "Hỏi" (Inquire) nhưng phải hỏi một người chơi KHÁC.</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)' }}>
            <h4 style={{ color: 'var(--color-crimson)' }}>⚖️ 3. Buộc tội (Accuse)</h4>
            <p>Thời khắc quyết định diễn ra!</p>
            <ul>
              <li>Đầu tiên, bạn phải <strong>lật ngửa thân phận thật</strong> của mình lên cho mọi người xem.</li>
              <li>Sau đó, phân phát lời Buộc tội (Accuse) để dự đoán vai của <strong>tất cả</strong> những người chưa bị lật bài. (Không bao gồm Khách Ẩn).</li>
              <li>Những người bị buộc tội bí mật nộp thẻ Thì thầm phản hồi: Nếu trúng thì nộp <strong>Yes</strong>, đoán sai thì nộp <strong>No</strong>. (Bốc bắt buộc nộp Thật).</li>
              <li>Tất cả thẻ sẽ được úp lấy xào lại và mở lật: Nếu toàn bộ là thẻ "Yes", bạn đã đoán trúng tất tay và <strong>THẮNG NGAY LẬP TỨC!</strong></li>
              <li>Nếu lọt thẻ "No", bạn thất bại, mất lượt của mình và trò chơi tiếp tục bình thường cho người tiếp theo. (Lưu ý: Dracula là người duy nhất nếu đoán sai sẽ có đặc quyền đoán lại lần thứ 2 ở ngay turn đó).</li>
            </ul>
          </div>

          <h3 style={{ color: 'var(--color-gold-bright)', marginTop: 'var(--space-lg)' }}>5. 🧙‍♂️ Sức Mạnh Khách Mời Đặc Biệt</h3>
          <ul>
            <li><strong style={{ color: 'var(--color-crimson)' }}>Dracula:</strong> Mặc định có trong mọi ván. Được xài quyền Buộc Tội (Accuse) 2 LẦN nến lần đầu tiên trong game đoán thất bại (có người trả lời No). Bị Alucard đoán trúng là thua ngay.</li>
            <li><strong style={{ color: 'var(--color-gold-bright)' }}>Alucard (Kẻ Ảo Ảnh):</strong> Thắng luôn nếu được Khiêu vũ với Dracula, hoặc nếu bị ai đó Buộc tội và gọi tên là "Dracula".</li>
            <li><strong style={{ color: 'var(--color-blood-glow)' }}>Van Helsing:</strong> Nếu bất kì ai xài quyền Buộc tội mà trả lời kết quả toàn bộ là "No" (Không trúng ai), Van Helsing lập tức bị kích hoạt thức tỉnh, phải lật ngửa bài để Buộc tội 1 người duy nhất trong bàn là Dracula. Đoán chuẩn là Thắng luôn!</li>
            <li><strong style={{ color: 'var(--color-gold-bright)' }}>Swamp Creature:</strong> Mộc nhân tinh lười biếng. Có đặc điểm chỉ có thể Buộc tội duy nhất 2 người bên trái/phải mình (Hàng Xóm). Đoán trúng cả 2 là vô địch! (Nếu hàng xóm đã lộ mặt, Swamp Creature lại phải đoán tất cả người chơi như bình thường).</li>
            <li><strong style={{ color: 'var(--color-crimson)' }}>Zombie:</strong> Phải chấp nhận MỌI lời mời Khiêu vũ. Khi mời người khác nhưng bị từ chối, Zombie có quyền chọn ÉP người đó lật bài, đồng thời Zombie cũng lật thân phận để tiến hành Buộc tội ngay lập tức.</li>
            <li><strong style={{ color: 'var(--color-crimson)' }}>Boogie Monster:</strong> Phải chấp nhận MỌI lời mời Khiêu vũ. Có quyền ngắt lời bất cứ ai nếu thấy có 2 người khác vừa Khiêu Vũ thành công, bằng cách nhảy ra giành quyền lật bài để Buộc tội.</li>
            <li><strong style={{ color: 'var(--color-blood-glow)' }}>Doctor Jekyll:</strong> Phải chấp nhận MỌI lời mời Khiêu Vũ. Được tự chọn đổi danh phận lấy Thẻ cất giấu của Khách Ẩn (Mystery Guest) ở giữa bàn trong lượt của mình và mang lấy một chức năng bí mật mới. Thẻ cũ bị lật công khai.</li>
            <li><strong style={{ color: 'var(--color-gold-bright)' }}>The Ghost:</strong> Mỗi khi bị ai đó đoán sai sự thật mình là nhân vật gì (kể cả lúc đang Inquire hay Accuse), có lựa chọn "Cướp lượt" để ngửa bài chứng minh họ sai, và tự giành quyền Buộc tội ngược lại họ hoặc cả bàn tuỳ thích.</li>
            <li><strong style={{ color: 'var(--color-blood-glow)' }}>Trickster (Gã Lừa Gạt):</strong> Năng lực duy nhất: Cho dù ai hỏi dò (Inquire) xem mình là ai, Trickster LUÔN LUÔN phải đưa thẻ trả lời "Yes" (Có, tôi là nhân vật đó). Lời nói thật chỉ được trả trong lúc Buộc Tội (Accuse).</li>
          </ul>

          <h3 style={{ color: 'var(--color-gold-bright)', marginTop: 'var(--space-lg)' }}>6. ⚠️ Lưu ý quan trọng</h3>
          <ul>
            <li><strong>Khi bị lộ bài (Revealed):</strong> Kể cả khi bạn đã bị lật bài úp (vì đoán sai buộc tội, hoặc bị xài phép), bạn VẪN ĐƯỢC CHƠI TIẾP. Bạn vẫn được "Hỏi" và "Buộc tội", MÀ CHỈ BỊ CẤM "Khiêu vũ" (Cấm cả mời và cấm cả bị ai đó mời). Ngoài ra, khi người khác đang Buộc tội cả bàn, bạn được miễn trừ không cần nộp thẻ phản hồi Yes/No nữa.</li>
            <li><strong>Khách Ẩn:</strong> Vai này vô gia cư úp ở giữa. Không ai có thể "Hỏi" hay "Khiêu vũ" với Khách Ẩn, cũng không cần chỉ định họ trong quá trình dự đoán Buộc tội.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
