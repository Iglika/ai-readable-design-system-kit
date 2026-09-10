# Component contract

These names are public APIs. Keep Figma variant axes, component properties, and code props aligned.

| Family | Variant axes | Component properties | Implementation intent |
|---|---|---|---|
| Icon | Name, Size | — | Swappable visual dependency for controls |
| Button | Type, Size, State | Label, Show leading icon, Leading icon, Show trailing icon, Trailing icon | Action button |
| Input | State | Value, Show leading icon, Leading icon, Show trailing icon, Trailing icon | Single-line text input |
| Textarea | State | Value | Multi-line text input |
| Select | State | Value, Icon | Select trigger or accessible listbox trigger |
| Checkbox | Selected, State | Label, Indicator icon | Independent or multi-select choice |
| Radio | Selected, State | Label | Single choice within a named group |
| Toggle | Checked, State | Label | Immediate binary setting |
| Form Field | State | Show label, Label, Required, Show helper, Helper text | Accessible label/control/help/error composition |

## State vocabulary

- Text controls: Default, Hovered, Focused, Filled, Error, Disabled. Select also includes Open.
- Choice controls: Default, Hovered, Focused, Error or Pressed where meaningful, Disabled.
- Button: Default, Hovered, Pressed, Focused, Disabled.

Do not rename a public property without documenting a migration. Treat the change like a code API change.

## Migrations

### 2026-09-07 — Form Field loses its `Control` property

**Was:** `State` variant axis *and* a `Control` instance-swap property.
**Now:** `State` axis only; the nested control is driven by the axis.

**Why.** Figma applies an `INSTANCE_SWAP` property's default to the nested instance in
**every variant of the set**. With `Control` exposed, all four Form Field variants silently
repointed to the default Input — the red error border and the focus ring disappeared while
the component still reported four distinct states. A variant axis and an instance-swap
property cannot both drive the same slot; the property always wins.

**Code impact.** None. `<FormField>` already takes its control as a child, so the React API
is unchanged. This is a Figma-side API change only.

**If you need a different control type** (Select, Textarea) inside a Form Field: add a
`Control type` variant axis rather than a swap property, or detach the instance.
