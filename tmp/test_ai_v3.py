import re

def analyze_ticket_v3(user_ticket):
    ticket_text = user_ticket.lower()
    
    # 1. Weights & Keywords
    weights = {
        "Billing": {
            "keywords": ["payment", "refund", "charge", "billing", "invoice", "sub", "price", "cost", "credit card", "money", "transaction", "overdue", "receipt", "double charge", "paid"],
            "boost": ["refund", "double charge", "fraud", "stolen"]
        },
        "Technical": {
            "keywords": ["bug", "error", "crash", "broken", "api", "server", "down", "slow", "latency", "integration", "endpoint", "timeout", "failure", "exception", "glitch", "not working", "404", "500", "connection", "database", "ui", "load", "loading", "working", "stuck"],
            "boost": ["down", "crash", "broken", "critical", "outage"]
        },
        "Security": {
            "keywords": ["password", "login", "reset", "2fa", "mfa", "identity", "security", "access", "sign in", "locking", "suspicious", "breach", "phishing", "account", "hacked", "compromised", "unauthorized", "get in", "locked out"],
            "boost": ["hacked", "breach", "compromised", "unauthorized", "security"]
        }
    }

    scores = {"Billing": 0, "Technical": 0, "Security": 0, "General": 1}
    
    # Matching logic
    for cat, data in weights.items():
        for k in data["keywords"]:
            if k in ticket_text:
                scores[cat] += 2 if k in data["boost"] else 1
                # Check for "not" or "can't" before the keyword
                if re.search(fr"(?:not|can'?t|don'?t|won'?t)\s+{k}", ticket_text):
                    scores[cat] += 2
        
        # Whole word match boost
        for k in data["keywords"]:
            if re.search(fr"\b{k}\b", ticket_text):
                scores[cat] += 1

    # Sentiment detection
    negative_words = ['angry', 'frustrated', 'bad', 'worst', 'hate', 'disappointed', 'terrible', 'furious', 'broken', 'failure', 'unacceptable', 'immediate', 'awful', 'poor', 'waiting', 'days', 'hours', 'still']
    neg_score = sum(2 for w in negative_words if w in ticket_text)
    
    sentiment = "Negative" if neg_score > 2 else "Neutral"
    if "thanks" in ticket_text or "happy" in ticket_text: sentiment = "Positive"

    # Priority Calculation
    priority = "Low"
    is_urgent = any(k in ticket_text for k in ['urgent', 'emergency', 'asap', 'critical', 'panic', 'production', 'immediately', 'right now'])
    
    category = max(scores, key=scores.get)
    if scores[category] <= 1 and (neg_score == 0): category = "General"

    # Multi-tier matrix
    if (category == "Security" and (neg_score > 2 or "hacked" in ticket_text)) or \
       (category == "Technical" and ("down" in ticket_text or "outage" in ticket_text) and neg_score > 0):
        priority = "Critical"
    elif is_urgent or neg_score > 4 or (category in ["Security", "Billing"] and neg_score > 0):
        priority = "High"
    elif neg_score > 1 or category in ["Technical", "Billing", "Security"]:
        priority = "Medium"
    
    return {
        "category": category,
        "priority": priority,
        "sentiment": sentiment,
        "scores": scores,
        "neg_score": neg_score
    }

test_cases = [
    "I was charged twice for my subscription but the invoice shows only one payment.",
    "The API returns a 500 error when I try to fetch user details using the /users/v1 endpoint.",
    "I forgot my password and the reset link is not arriving in my inbox.",
    "Is there a way to change my profile picture?",
    "URGENT: Database is down and customer data is inaccessible!",
    "I can't get in to my account, help please.",
    "Refund my money because the server crashed.",
    "I'm very sorry to bother you but it's been 3 days and I still haven't received my password reset email."
]

for i, case in enumerate(test_cases, 1):
    res = analyze_ticket_v3(case)
    print(f"\n[{i}] {case}")
    print(f"    {res['category']} | {res['priority']} | {res['sentiment']} (Scores: {res['scores']}, Neg: {res['neg_score']})")
