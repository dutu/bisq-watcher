# Rule Module

This module serves as the entry (or export) file for processing log events. It imports rules defined in various `.mjs` files within this directory, to form a set of rules for log event parsing and notification. 
<br>Defined rules are grouped in different `.mjs` files by function or other criteria.

## Typedef: Rule

### Properties

| Property        | Type                                                        | Description                                                                                                                                                       | Default |
|-----------------|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `eventName`     | `string`                                                    | The name of the custom event to emit when a match is found.                                                                                                       |         |
| `logger`        | `string` (Optional)                                         | The origin logger of the Bisq log event.                                                                                                                          |         |
| `thread`        | `string` (Optional)                                         | The origin thread of the Bisq log event.                                                                                                                          |         |
| `pattern`       | `string`                                                    | The string pattern to match against the Bisq log event.<br>Variables can be extracted using placeholders like `{0}`, `{1}`, etc.                                  |         |
| `message`       | `string`                                                    | A template string for formatting the message to emit.<br>Use `{index}` as a placeholder for extracted variables. Use `{*}` as a placeholder for the entire match. |         |
 | `level`         | `'crit' \| 'alert' \| 'error' \| 'warning' \| 'info' \| 'notice' \| 'debug'` (Optional) | Overwrites the severity level of the original Bisq log event.                                                                         |         |
| `sendToTelegram`| `boolean` (Optional)                                        | Flag indicating whether to send the message to Telegram.                                                                                                          | `true`  |
| `isActive`      | `boolean` (Optional)                                        | Flag indicating whether the rule is active or not.                                                                                                                | `true`  |

### Example

For the Bisq log event:

```text
Jan-31 03:38:29.631 [JavaFX Application Thread] INFO  b.c.n.a.MyOfferTakenEvents: We got a offer removed. id=TUFKRF-206A5b9b-w195-42ed-8253-f3cffe9f61c1-187, state=RESERVED 
```

we created the rule

```js
{
  eventName: 'myOfferTaken',
  logger: 'b.c.n.a.MyOfferTakenEvents',
  pattern: 'We got a offer removed. id={0}-',
  message: '({0}) Your offer with ID {0} was taken',
  level: 'notice',
  sendToTelegram: true,
  isActive: true,
}
```

to send the message `'(TUFKRF) Your offer with ID TUFKRF was taken'`.
