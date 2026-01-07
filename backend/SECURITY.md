# Security Guidelines for AIDO Backend

## Environment Variables

### Critical Security Requirements

1. **Never commit `.env` files**
   - `.env` files contain sensitive credentials (DATABASE_URL, JWT_SECRET)
   - Always use `.env.example` as template
   - `.env` is in `.gitignore` - verify it stays there

2. **Database Credentials**
   - **DATABASE_URL** contains Neon database password
   - Get from: https://console.neon.tech/ → Project "aido-todo" → Connection string
   - Use psycopg3 format: `postgresql+psycopg://user:password@host/db?sslmode=require`
   - **SSL is required** (`sslmode=require`) - never disable

3. **JWT Secret**
   - **JWT_SECRET** must be cryptographically random
   - Minimum 32 characters
   - Generate with: `python -c "import secrets; print(secrets.token_hex(32))"`
   - **Never share** between dev/staging/production environments

## Setting Up Environment

### For New Developers

```bash
# 1. Copy template
cp backend/.env.example backend/.env

# 2. Get Neon connection string
# Visit: https://console.neon.tech/
# Select project: "aido-todo"
# Click: "Connection string" → Choose "psycopg3"
# Copy the full string

# 3. Edit backend/.env and paste DATABASE_URL
nano backend/.env

# 4. Verify .env is ignored
git status | grep .env
# Should return nothing (file is ignored)
```

### Rotating Credentials

#### Rotate Database Password

1. Open Neon console: https://console.neon.tech/
2. Select project "aido-todo"
3. Go to: Settings → Roles
4. Find role: `neondb_owner`
5. Click: "Reset Password"
6. Copy new password
7. Update `DATABASE_URL` in `backend/.env`
8. Restart backend server

#### Rotate JWT Secret

1. Generate new secret:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
2. Update `JWT_SECRET` in `backend/.env`
3. Update `JWT_SECRET` in `frontend/.env.local` (must match!)
4. Restart both backend and frontend
5. **Note**: All existing user sessions will be invalidated

## Verification Checklist

Before committing code:

- [ ] Run: `git status | grep ".env"`
  - Should return nothing (not tracked)

- [ ] Run: `grep -r "postgresql://" backend/src/`
  - Should return nothing (no hardcoded credentials)

- [ ] Run: `grep -r "npg_" backend/src/`
  - Should return nothing (no hardcoded passwords)

- [ ] Verify `backend/.env.example` has all keys documented

- [ ] Verify `.gitignore` contains `backend/.env`

## What to Do If Credentials Are Leaked

### If DATABASE_URL is exposed:

1. **Immediate**: Rotate password in Neon console (see above)
2. Update `DATABASE_URL` in `backend/.env`
3. Restart backend
4. Notify team

### If JWT_SECRET is exposed:

1. **Immediate**: Generate new JWT_SECRET
2. Update in both `backend/.env` and `frontend/.env.local`
3. Restart both services
4. All users will need to re-login
5. Notify team

### If committed to git:

1. **DO NOT** just delete the file - git history retains it
2. Contact team lead immediately
3. Rotate all exposed credentials
4. Consider using `git-filter-repo` or `BFG Repo-Cleaner` to remove from history
5. Force push (coordinate with team)

## Security Best Practices

1. **Use strong, unique secrets per environment**
   - Dev, staging, production should have different credentials

2. **Limit credential access**
   - Only share with team members who need them
   - Use secure channels (1Password, Bitwarden, encrypted messages)

3. **Monitor for breaches**
   - Check Neon console for unexpected activity
   - Review backend logs for suspicious auth attempts

4. **Keep dependencies updated**
   - Run: `pip list --outdated` regularly
   - Update security-critical packages (fastapi, sqlalchemy, pyjwt, bcrypt)

5. **Regular audits**
   - Monthly credential rotation (production)
   - Quarterly security reviews
   - Annual penetration testing

## Resources

- Neon Console: https://console.neon.tech/
- Neon Docs: https://neon.tech/docs/
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Python Secrets Module: https://docs.python.org/3/library/secrets.html
