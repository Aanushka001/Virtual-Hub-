from utils.database import db

class ChatModel:
    @staticmethod
    def send_message(sender_id, recipient_id, content, message_type='text'):
        message_data = {
            'senderId': sender_id,
            'recipientId': recipient_id,
            'content': content,
            'type': message_type,
            'isRead': False
        }
        
        message_id = db.create_document('messages', message_data)
        
        conversation_id = '_'.join(sorted([sender_id, recipient_id]))
        conversation = db.get_document('conversations', conversation_id)
        
        if not conversation:
            conversation_data = {
                'id': conversation_id,
                'participants': sorted([sender_id, recipient_id]),
                'lastMessage': content,
                'lastMessageAt': db.get_timestamp(),
                'unreadCount': {sender_id: 0, recipient_id: 1}
            }
            db.create_document('conversations', conversation_data)
        else:
            unread_count = conversation.get('unreadCount', {})
            unread_count[recipient_id] = unread_count.get(recipient_id, 0) + 1
            
            db.update_document('conversations', conversation_id, {
                'lastMessage': content,
                'lastMessageAt': db.get_timestamp(),
                'unreadCount': unread_count
            })
        
        return message_id
    
    @staticmethod
    def get_conversation_messages(user1_id, user2_id, limit=50):
        messages = db.query_collection(
            'messages',
            filters=[
                ('senderId', 'in', [user1_id, user2_id]),
                ('recipientId', 'in', [user1_id, user2_id])
            ],
            order_by=('createdAt', 'desc'),
            limit=limit
        )
        
        filtered_messages = []
        for msg in messages:
            if (msg['senderId'] == user1_id and msg['recipientId'] == user2_id) or \
               (msg['senderId'] == user2_id and msg['recipientId'] == user1_id):
                filtered_messages.append(msg)
        
        return list(reversed(filtered_messages))
    
    @staticmethod
    def mark_messages_read(user_id, other_user_id):
        conversation_id = '_'.join(sorted([user_id, other_user_id]))
        conversation = db.get_document('conversations', conversation_id)
        
        if conversation:
            unread_count = conversation.get('unreadCount', {})
            unread_count[user_id] = 0
            
            db.update_document('conversations', conversation_id, {
                'unreadCount': unread_count
            })
    
    @staticmethod
    def get_user_conversations(user_id):
        conversations = db.query_collection(
            'conversations',
            filters=[('participants', 'array_contains', user_id)],
            order_by=('lastMessageAt', 'desc')
        )
        return conversations
