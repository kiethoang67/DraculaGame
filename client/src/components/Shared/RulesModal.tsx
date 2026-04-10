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

          <h3 style={{ color: 'var(--color-gold-bright)', marginTop: 'var(--space-lg)' }}>5. 🏆 Điều kiện chiến thắng Đặc Diệt</h3>
          <ul>
            <li><strong>Thắng nhờ Buộc Tội (Đoán trúng cả bàn):</strong> Tiêu chuẩn thắng cơ bản.</li>
            <li><strong>Alucard (Kẻ Ảo Ảnh):</strong> Thắng nếu được Khiêu vũ với Dracula, hoặc nếu ai đó Buộc tội bạn và quy bạn là "Dracula".</li>
            <li><strong>Van Helsing (Thợ Săn):</strong> Nếu có một pha Buộc tội bất kỳ ra kết quả toàn "No", lập tức Van Helsing kích hoạt. Phải lật bài và chỉ buộc tội 1 người duy nhất là Dracula. Đoán chuẩn là Thắng luôn!</li>
            <li><strong>Swamp Creature (Mộc Nhân Tinh):</strong> Chỉ cần Buộc tội trúng DUY NHẤT 2 người bên cạnh trái phải của mình (hàng xóm) là lập tức vô địch.</li>
          </ul>

          <h3 style={{ color: 'var(--color-gold-bright)', marginTop: 'var(--space-lg)' }}>6. ⚠️ Lưu ý quan trọng</h3>
          <ul>
            <li><strong>Khi bị lật bài (Revealed):</strong> Khi bạn thân thế bạn đã bị phơi bày/hoặc buộc tội xịt thì bạn vẫn chơi! Bạn vẫn được "Hỏi" và "Buộc tội", MÀ CHỈ BỊ CẤM "Khiêu vũ". Khi ai khác Buộc tội cả bàn, bạn được miễn nhiễm không cần đưa thẻ phản hồi nữa.</li>
            <li><strong>Khách Ẩn:</strong> Vai này vô gia cư. Ai cũng không thể "Hỏi" hay "Khiêu vũ" với nó. Khỏi phải đoán Khách Ẩn khi dùng chức năng Buộc tội.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
