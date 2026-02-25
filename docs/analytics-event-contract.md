# Analytics Event Contract (v1)

This document defines production analytics events for conversion measurement.

## KPIs

- `qualified_leads`: count of successful contact submissions.
- `contact_intent_rate`: CTA clicks to `/contact` per session.
- `form_completion_rate`: successful leads divided by form starts.
- `loader_impact`: loader actions vs lead outcomes.
- `social_engagement`: outbound social clicks by network.

## Global Rules

- Naming: `snake_case`, lowercase, max 40 chars.
- No PII in events or params.
- Always include `page_path`.
- Event source should be derivable:
  - client events include `transport_type=beacon`
  - server events include `event_source=server`

## Event Definitions

1. `cta_click`
- Trigger: click on internal `/contact` CTA links.
- Params: `cta_location`, `cta_label`, `destination_path`.

2. `social_click`
- Trigger: click on outbound social profile links.
- Params: `network`, `click_location`.

3. `contact_form_start`
- Trigger: first form interaction on contact form.
- Params: `form_id`.

4. `contact_form_submit`
- Trigger: submit attempt after client-side validation passes.
- Params: `form_id`.

5. `contact_form_error`
- Trigger: validation failure or API failure.
- Params:
  - validation: `error_type=validation`, `invalid_fields_count`
  - api: `error_type=api`, `status_code`

6. `generate_lead`
- Trigger: successful contact API response.
- Params: `lead_type`, `service_focus`.

7. `loader_action`
- Trigger: loader actions.
- Params: `action` (`skip`, `extend`, `auto_redirect`, `reduced_motion_redirect`), optional `seconds_added`.

8. `faq_open`
- Trigger: accordion item opened.
- Params: `question` (truncated label).

9. `lead_accepted_server` (optional)
- Trigger: server-side fallback signal after accepted contact submission.
- Params: `event_source=server`, `lead_type`, `service_focus`.

## Validation Checklist

1. Accept analytics consent and verify events in GA4 DebugView.
2. Decline consent and verify no GA requests/events are sent.
3. Submit contact form successfully and verify:
- `contact_form_start`
- `contact_form_submit`
- `generate_lead`
- optional `lead_accepted_server`
4. Trigger validation error and verify `contact_form_error`.
5. Trigger loader actions and verify `loader_action`.
