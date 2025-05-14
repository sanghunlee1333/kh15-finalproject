export function isPlanAllCompleted(event) {
    const receivers = event.extendedProps.receivers || [];
    return receivers.length > 0 && receivers.every(r => r.planReceiveStatus === "달성");
}