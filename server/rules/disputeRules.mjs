/**
 * This module exports an array of dispute-related rule objects.
 *
 * @see {@link ./rules.mjs} for the definition of Rule.
 * @type {Rule[]}
 */
export default [
  {
    eventName: 'Trader ChatMessage',
    logger: 'b.c.s.t.TraderChatManager',
    pattern: 'Received ChatMessage with tradeId {0}-',
    message: '({0}) Received chat message',
    level: 'notice',
    sendToTelegram: true,
    isActive: true,
  },
  {
    eventName: 'OpenNewDisputeMessage',
    logger: 'b.c.s.d.DisputeManager',
    pattern: 'Send OpenNewDisputeMessage to peer {0}.{1}. tradeId={3}-',
    message: '({0}) New dispute open',
    level: 'notice',
    sendToTelegram: true,
    isActive: true,
  },
  {
    eventName: 'Mediation PeerOpenedDisputeMessage',
    logger: 'b.c.s.d.m.MediationManager',
    pattern: 'Received PeerOpenedDisputeMessage with tradeId {0}-',
    message: '({0}) Peer opened mediation',
    level: 'notice',
    sendToTelegram: true,
    isActive: true,
  },
  {
    eventName: 'Mediation ChatMessage',
    logger: 'b.c.s.d.m.MediationManager',
    pattern: 'Received ChatMessage with tradeId {0}-',
    message: '({0}) Received mediation chat message',
    level: 'notice',
    sendToTelegram: true,
    isActive: true,
  },
  {
    eventName: 'Mediation DisputeResultMessage',
    logger: 'b.c.s.d.m.MediationManager',
    pattern: 'Received DisputeResultMessage with tradeId {0}-',
    message: '({0}) Received mediation result message',
    level: 'notice',
    sendToTelegram: true,
    isActive: true,
  },
  {
    eventName: 'Arbitration PeerOpenedDisputeMessage',
    logger: 'b.c.s.d.r.RefundManager',
    pattern: 'Received PeerOpenedDisputeMessage with tradeId {0}-',
    message: '({0}) Peer opened arbitration',
    level: 'notice',
    sendToTelegram: true,
    isActive: true,
  },
  {
    eventName: 'Arbitration ChatMessage',
    logger: 'b.c.s.d.r.RefundManager',
    pattern: 'Received ChatMessage with tradeId {0}-',
    message: '({0}) Received arbitration chat message',
    level: 'notice',
    sendToTelegram: true,
    isActive: true,
  },
  {
    eventName: 'Arbitration DisputeResultMessage',
    logger: 'b.c.s.d.r.RefundManager',
    pattern: 'Received DisputeResultMessage with tradeId {0}-',
    message: '({0}) Received arbitration result message',
    level: 'notice',
    sendToTelegram: true,
    isActive: true,
  },
]
