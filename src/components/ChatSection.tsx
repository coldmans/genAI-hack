import React from 'react';
import { MessageCircle } from 'lucide-react';

export function ChatSection() {
  return (
    <div className="chat-container">
      {/* 챗봇 헤더 */}
      <div className="chat-header">
        <div className="chat-icon">
          <MessageCircle />
        </div>
        <div className="chat-title">
          <h3>AI 정책 상담</h3>
          <p>소상공인 맞춤 정책 안내</p>
        </div>
      </div>

      {/* AWS QuickSight Chatbot */}
      <div className="chat-frame">
        <iframe
          width="100%"
          height="100%"
          allow="clipboard-read https://us-east-1.quicksight.aws.amazon.com; clipboard-write https://us-east-1.quicksight.aws.amazon.com"
          src="https://us-east-1.quicksight.aws.amazon.com/sn/embed/share/accounts/719030485343/chatagents/624c6a78-a617-46a4-9a0a-096c3f515ffe?directory_alias=genai-livinglab"
          title="AI 정책 비서 챗봇"
        />
      </div>
    </div>
  );
}
