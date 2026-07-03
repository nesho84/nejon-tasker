// Display state for a task's reminder:
// - 'none'   no reminder scheduled
// - 'active' scheduled in the future and will fire (notifications enabled)
// - 'muted'  scheduled in the future but notifications are off → it will NOT fire
// - 'past'   reminder datetime has already elapsed
export type ReminderStatus = 'none' | 'active' | 'muted' | 'past';
