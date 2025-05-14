package com.kh.acaedmy_final.vo.websocket;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class ChatRoomResponseVO {
	private String roomTitle;
    private List<ChatResponseVO> messages;

    // Getter, Setter
    public String getRoomTitle() {
        return roomTitle;
    }

    public void setRoomTitle(String roomTitle) {
        this.roomTitle = roomTitle;
    }

    public List<ChatResponseVO> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatResponseVO> messages) {
        this.messages = messages;
    }

}

