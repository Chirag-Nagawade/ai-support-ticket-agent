import re

# -------------------------------------------------------------------
# PURE DETERMINISTIC AI ENGINE (v5)
# No GPT-2. No timeouts. No random text generation.
# All classification is rules-based with weighted scoring.
# Sub-second response time guaranteed.
# -------------------------------------------------------------------

WEIGHTS = {
    "Billing": {
        "keywords": [
            "payment", "refund", "charge", "billed", "billing", "invoice",
            "subscription", "price", "cost", "credit card", "money", "transaction",
            "overdue", "receipt", "paid", "twice", "double", "fee", "plan", "upgrade",
            "downgrade", "cancel", "cancellation", "auto-renew", "charged", "debit"
        ],
        "boost": ["refund", "twice", "double", "overcharged", "fraud", "stolen", "charged"]
    },
    "Technical": {
        "keywords": [
            "bug", "error", "crash", "broken", "api", "server", "down", "slow",
            "latency", "integration", "endpoint", "timeout", "failure", "exception",
            "glitch", "not working", "404", "500", "connection", "database",
            "load", "loading", "stuck", "stopped", "failed", "performance",
            "outage", "unresponsive", "offline", "blank page", "white screen",
            "not loading", "keeps crashing", "won't open", "screen"
        ],
        "boost": ["down", "crash", "broken", "outage", "fatal", "error", "500", "offline"]
    },
    "Security": {
        "keywords": [
            "password", "login", "sign in", "log in", "reset", "2fa", "mfa",
            "identity", "security", "access", "locked", "locking", "locked out",
            "suspicious", "breach", "phishing", "hacked", "compromised",
            "unauthorized", "get in", "locked out", "recovery", "verify",
            "forgot", "account taken", "strange activity", "unknown device"
        ],
        "boost": ["hacked", "breach", "compromised", "unauthorized", "hijacked", "locked"]
    }
}

NEGATIVE_WORDS = [
    "angry", "frustrated", "frustrating", "bad", "worst", "hate", "disappointed",
    "terrible", "furious", "broken", "failure", "unacceptable", "awful", "poor",
    "waiting", "waited", "days", "weeks", "hours", "still", "stuck", "urgent",
    "immediately", "asap", "now", "ridiculous", "outrageous", "wrong", "incorrect",
    "never", "cannot", "won't", "doesn't", "didn't", "not working", "keeps"
]

POSITIVE_WORDS = [
    "thanks", "thank you", "good", "great", "awesome", "happy", "love",
    "perfect", "resolved", "amazing", "brilliant", "helpful", "appreciate",
    "wonderful", "excellent", "satisfied", "pleased"
]

URGENT_KEYWORDS = [
    "urgent", "emergency", "asap", "immediately", "right now", "critical",
    "panic", "production", "down", "outage", "refund", "fraud", "hacked"
]


def extract_amount(text):
    """Extract monetary amounts for personalization."""
    match = re.search(r'(\$[\d,]+(?:\.\d{1,2})?|[\d,]+(?:\.\d{1,2})?\s*(?:usd|inr|dollars|rupees))', text, re.IGNORECASE)
    return match.group(1) if match else ""


def generate_summary(title, description, category, priority):
    """Generate a concise, specific AI summary based on category and content."""
    text = f"{title} {description}".lower()

    # Extract key identifiers for specificity
    amount = extract_amount(text)

    summaries = {
        "Billing": {
            "Critical": f"Critical billing fraud or unauthorized charge detected",
            "High": f"Urgent payment dispute: {amount} refund requested" if amount else "Urgent billing discrepancy requiring immediate resolution",
            "Medium": f"Billing issue: {amount} charge under review" if amount else "Subscription or payment record discrepancy",
            "Low": "General billing inquiry received"
        },
        "Technical": {
            "Critical": "CRITICAL: Production system failure — service offline",
            "High": "High-severity technical failure impacting user workflow",
            "Medium": "Technical malfunction detected in user environment",
            "Low": "Minor technical query or feature question"
        },
        "Security": {
            "Critical": "ALERT: Account compromise or unauthorized access confirmed",
            "High": "High-risk account security incident — immediate review needed",
            "Medium": "Account access issue: credential or authentication problem",
            "Low": "Security-related inquiry or password reset request"
        },
        "General": {
            "Critical": "Urgent general support request",
            "High": "High-priority support request requiring prompt attention",
            "Medium": "Support request submitted for team review",
            "Low": "General inquiry — routing to support team"
        }
    }

    return summaries.get(category, summaries["General"]).get(priority, "Support request received")


def analyze_ticket(user_ticket, previous_tickets=[]):
    ticket_text = user_ticket.lower()

    # --- STEP 1: Category Scoring ---
    scores = {"Billing": 0, "Technical": 0, "Security": 0, "General": 1}
    for cat, data in WEIGHTS.items():
        for k in data["keywords"]:
            if k in ticket_text:
                scores[cat] += 4 if k in data["boost"] else 1
                # Negation/urgency amplifier: "can't login", "not loading"
                if re.search(r"(?:not|can'?t|don'?t|won'?t|couldn'?t|never|still|keep|keeps)\s+" + re.escape(k), ticket_text):
                    scores[cat] += 5

    category = max(scores, key=scores.get)
    if scores[category] <= 1:
        category = "General"

    # --- STEP 2: Team Routing ---
    team_map = {
        "Billing": "Billing Team",
        "Technical": "Technical Team",
        "Security": "Account Team",
        "General": "Support Team"
    }
    assigned_team = team_map[category]

    # --- STEP 3: Sentiment Analysis ---
    neg_hits = [w for w in NEGATIVE_WORDS if w in ticket_text]
    pos_hits = [w for w in POSITIVE_WORDS if w in ticket_text]
    neg_score = len(neg_hits) * 2
    pos_score = len(pos_hits) * 2

    if neg_score >= 2:
        sentiment = "Negative"
        tone = "We sincerely apologize for the inconvenience. Our team is prioritizing your case immediately. "
    elif pos_score >= 2:
        sentiment = "Positive"
        tone = "Thank you for your kind message! "
    else:
        sentiment = "Neutral"
        tone = "Thank you for reaching out. "

    # --- STEP 4: Priority Matrix ---
    is_urgent = any(k in ticket_text for k in URGENT_KEYWORDS)
    is_hacked = any(k in ticket_text for k in ["hacked", "compromised", "breach", "hijacked"])
    is_down = any(k in ticket_text for k in ["down", "offline", "outage", "not loading", "crashed"])

    if (category == "Security" and (is_hacked or neg_score >= 6)) or \
       (category == "Technical" and is_down and neg_score >= 2):
        priority = "Critical"
    elif is_urgent or (category in ["Billing", "Security"] and neg_score >= 4) or neg_score >= 8:
        priority = "High"
    elif category in ["Billing", "Technical", "Security"] or neg_score >= 2:
        priority = "Medium"
    else:
        priority = "Low"

    # Positive override: happy users always get Low priority
    if sentiment == "Positive":
        priority = "Low"

    # --- STEP 5: Build AI Response ---
    res_time_map = {
        "Critical": "within 1 hour",
        "High": "within 2-4 hours",
        "Medium": "within 6-12 hours",
        "Low": "within 1-2 business days"
    }
    res_time = res_time_map[priority]

    amount = extract_amount(ticket_text)
    amount_ctx = f" for the {amount}" if amount else ""

    response_templates = {
        "Billing": f"{tone}Our billing team is reviewing your account records{amount_ctx}. We will resolve this {res_time}.",
        "Technical": f"{tone}Our engineering team has been alerted and is investigating the issue. Expect a resolution {res_time}.",
        "Security": f"{tone}Your account security is our top priority. A security analyst will review this {res_time}.",
        "General": f"{tone}Your request has been received and assigned to our support team. We will respond {res_time}."
    }
    ai_response = response_templates[category]

    # --- STEP 6: Generate Smart Summary ---
    # Extract title from the combined "Title: Description" format sent by the backend
    title_part = user_ticket.split(":")[0].strip() if ":" in user_ticket else user_ticket
    ai_summary = generate_summary(title_part, user_ticket, category, priority)

    reason = (
        f"Category: {category} (score: {scores[category]}) | "
        f"Sentiment: {sentiment} (neg_hits: {neg_score}) | "
        f"Priority: {priority} | Urgent keywords: {is_urgent}"
    )

    print(f"[AI ENGINE] {category} | {priority} | {sentiment} | Scores: {dict(list(scores.items())[:3])}")

    return {
        "priority": priority,
        "sentiment": sentiment,
        "category": category,
        "reason": reason,
        "suggested_action": f"Route to {assigned_team} and apply {priority.lower()}-priority resolution workflow.",
        "resolution_time": res_time,
        "assigned_team": assigned_team,
        "similar_issues": str(len(previous_tickets)),
        "ai_response": ai_response,
        "ai_summary": ai_summary
    }
