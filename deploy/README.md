# Deploying to AWS EC2 (Free Tier)

This hosts the whole site — the Vue SPA **and** the `/api/contact` backend — as a single
Rust binary on one small Linux VM, with [Caddy](https://caddyserver.com/) in front for
automatic HTTPS.

Files in this folder:

| File                 | Purpose                                                       |
| -------------------- | ------------------------------------------------------------ |
| `setup.sh`           | One-shot: installs deps, builds, installs the systemd service |
| `update.sh`          | Redeploy after code changes                                  |
| `portfolio.service`  | systemd unit that keeps the server running / restarts it     |
| `Caddyfile`          | Reverse proxy + auto-HTTPS config                            |

---

## 1. Launch the instance

1. EC2 → **Launch instance**.
2. **AMI:** Ubuntu Server 24.04 LTS (must say *Free tier eligible*).
3. **Instance type:** `t3.micro` (or `t2.micro` — whichever your region marks *Free tier eligible*).
4. **Key pair:** create/download one so you can SSH in.
5. **Network / security group** — allow inbound:
   - **22** (SSH) — restrict to *My IP*
   - **80** (HTTP)
   - **443** (HTTPS)
   - ❌ **Do NOT open 8080.** The app listens there, but only Caddy (on the same box) talks to it.
6. Launch. Then **Elastic IP → Allocate → Associate** with the instance so the public IP
   doesn't change on reboot. (An Elastic IP is free while attached to a running instance.)

## 2. Point your domain at it (needed for HTTPS)

Add a DNS **A record** for your domain → the instance's Elastic IP. (No domain yet? See
*Testing without a domain* at the bottom.)

## 3. Get the code onto the box

SSH in (`ssh -i your-key.pem ubuntu@YOUR_IP`), then either clone from GitHub:

```bash
sudo apt-get update -y && sudo apt-get install -y git
git clone https://github.com/<you>/<repo>.git portfolio && cd portfolio
```

…or, if it's not on GitHub yet, copy it up from your Windows machine (run locally):

```powershell
scp -i your-key.pem -r "c:\Users\mineb\Desktop\Portfolio Website" ubuntu@YOUR_IP:~/portfolio
```

> **Resume:** make sure `frontend/public/Resume.pdf` exists *before* building, or the
> nav/footer Resume link will 404. (Drop your PDF there now if you haven't.)

## 4. Build + install the service

From the repo root on the instance:

```bash
chmod +x deploy/setup.sh deploy/update.sh
./deploy/setup.sh
```

This adds swap (so the 1 GB box doesn't run out of memory during the Rust release build —
expect the build to take a few minutes), installs Node + Rust, builds everything, and starts
the `portfolio` systemd service on `127.0.0.1:8080`.

Check it: `curl -s localhost:8080/api/health` → `ok`.

## 5. Install Caddy (HTTPS)

```bash
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy
```

Put your domain in the Caddyfile and load it:

```bash
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile      # replace example.com with your domain
sudo systemctl reload caddy
```

Visit **https://your-domain.com** — Caddy fetches a Let's Encrypt cert automatically the
first time. Done. 🎉

---

## Updating after you change the site

Pull/copy the new code to the box, then:

```bash
./deploy/update.sh
```

It rebuilds and restarts the service (Caddy keeps running untouched).

## Contact-form submissions

Every submission is always appended to a file on the server (durable backup):

```bash
cat /opt/portfolio/data/messages.jsonl
```

### Email notifications (Resend)

The server also emails each submission to you when a Resend API key is configured. The key
is read from `/etc/portfolio.env` (referenced by the systemd unit, kept out of git):

1. Sign up at <https://resend.com> **with the same Gmail you want to receive at** — that lets
   Resend's test sender (`onboarding@resend.dev`) deliver to you without verifying a domain.
2. Create an **API key** (Resend dashboard → API Keys).
3. On the server, write it to the env file and restart:
   ```bash
   echo 'RESEND_API_KEY=re_your_key_here' | sudo tee /etc/portfolio.env >/dev/null
   sudo chmod 600 /etc/portfolio.env
   sudo systemctl restart portfolio
   ```

Tune the recipient/sender via the same file if needed:
`CONTACT_TO=you@example.com`, `CONTACT_FROM=Name <onboarding@resend.dev>`.
Replies to the notification go to the visitor's address (set as `reply_to`).

Later, to send *from* your own domain (e.g. `contact@gursimar.xyz`) instead of the test
sender, verify gursimar.xyz in Resend and set `CONTACT_FROM` accordingly.

## Useful commands

```bash
sudo systemctl status portfolio      # is it running?
sudo journalctl -u portfolio -f      # live server logs
sudo systemctl restart portfolio     # restart
```

## Testing without a domain

HTTPS needs a domain (Let's Encrypt won't issue certs for a bare IP). To eyeball the site
before DNS is set up, temporarily add port **8080** to the security group and open
`http://YOUR_IP:8080`. **Remove that rule afterward** — long-term, only 80/443 should be open.

## Cost reminder

The EC2 free tier covers **750 hours/month for 12 months** (one instance running 24/7).
After 12 months a `t3.micro` is roughly **$8–10/month**. Storage and a steadily-attached
Elastic IP stay within free limits for this workload.
