
## CSRF Attack

### Description
Cross-Site Request Forgery (CSRF) is an attack that tricks a user into executing unwanted actions on a web application where they are authenticated. By exploiting the trust that a website has in the user's browser, an attacker can perform actions on behalf of the user without their consent.

### Where to Test
> https://csrf.m14r41.in/
- Web applications that rely on cookies for authentication.
- Forms that perform state-changing actions (e.g., updating email, password changes, making payments).
- Applications with no CSRF protection or weak implementation of CSRF tokens.
- Websites that do not enforce the `SameSite` attribute in cookies.

### How to Test
1. **Check for CSRF tokens:** Inspect requests using browser dev tools or a proxy (Burp Suite) to see if CSRF tokens are used.
2. **Modify request methods:** Try changing POST requests to GET if CSRF tokens are only checked on certain methods.
3. **Test Referer header validation:** Remove or modify the `Referer` header to see if the request still goes through.
4. **Craft a CSRF attack page:** Create an HTML form that submits a malicious request and check if the action executes.
5. **Look for cookie-based protections:** Check for `SameSite` cookie attributes and test for bypasses.

### Impact
- Unauthorized actions on a victim’s account (e.g., changing email, modifying account details).
- Financial fraud (e.g., transferring money, purchasing items without consent).
- Privilege escalation if used to modify user roles.
- Data leakage if sensitive actions can be triggered.

### Mitigation
- **Use CSRF Tokens:** Implement server-side generated CSRF tokens that are validated on each request.
- **Enforce SameSite Cookies:** Set `SameSite=Strict` or `SameSite=Lax` to prevent cross-origin request execution.
- **Check Referer Headers:** Validate the `Referer` or `Origin` header to ensure requests originate from trusted sources.
- **Use Secure Authentication Methods:** Implement multi-factor authentication (MFA) to reduce CSRF impact.
- **Implement CAPTCHAs:** Require user interaction (e.g., CAPTCHA) on critical actions to prevent automated CSRF attacks.

### Common Bypasses
- Using GET instead of POST (if the server only checks method type)
- Removing or modifying CSRF tokens
- Leveraging SameSite cookie misconfigurations
- Exploiting Referer header validation weaknesses
- Finding open redirects to trick the server into executing a malicious request
- Utilizing JSONP endpoints or CORS misconfigurations

---
### Online csrf Poc generator
> https://csrf.m14r41.in/

## Portswigger Lab

>https://portswigger.net/web-security/csrf

### LAB 01: CSRF vulnerability with no defenses
- Simple create CSRF HTML and done.

### LAB 02: CSRF where token validation depends on request method
- Change the request method, i.e., POST to GET.

### LAB 03: CSRF where token validation depends on token being present
- Remove the CSRF parameter and its values.

### LAB 04: CSRF where token is not tied to user session
- Get CSRF token from user first and don't use the token.
- Craft CSRF token in CSRF form including the captured token and send.

### LAB 05: CSRF where token is tied to non-session cookie
- Get the CSRF token from first user and don't use it. This time CSRF key is also present. CSRF token and CSRF key are bound.
- Find any request which sets header and allows cookies injection, i.e., requires passing CSRF key and CSRF token together.

### LAB 06: CSRF where token is duplicated in cookie
- Since CSRF key and CSRF token are the same, it's similar to the previous one.
- Craft CSRF form and it's done.

### LAB 07: SameSite Lax bypass via method override
- Guess any parameter/method convention/pattern which is accepted by the server in POST, as Lax only accepts data in GET.

### LAB 08: SameSite Strict bypass via client-side redirect
- Request should originate only from the site. Find any redirect point which can request another URL.
- Find any function which redirects somewhere, now craft CSRF here. As the redirection is initiated by the application itself, it will work.

### LAB 09: SameSite Strict bypass via sibling domain
- Identify how WebSocket initiates chat and then craft payload to send.

### LAB 10: SameSite Lax bypass via cookie refresh

### LAB 11: CSRF where Referer validation depends on header being present
- Delete the Referer header and create CSRF form.
- Add a meta tag with Referer values set to `no-referrer`.

### LAB 12: CSRF with broken Referer validation
