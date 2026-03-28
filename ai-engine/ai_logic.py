import re

# Initialize local models lazily to handle background installation
generator = None

def load_generator():
    global generator
    if generator is not None:
        return generator
    try:
        from transformers import pipeline, set_seed
        print("Loading local GPT-2 model...")
        generator = pipeline('text-generation', model='gpt2')
        set_seed(42)
        return generator
    except (ImportError, Exception) as e:
        print(f"Local GPT-2 not yet available: {e}")
        return None

def extract_entities(text):
    """Simple extraction of numbers, price mentions and nouns for personalization."""
    # Price/Numbers
    price_match = re.search(r'(\d+[\d.,]*\s*(?:\$|usd|inr|ticket|tickets|credits|items)?)', text)
    entity = price_match.group(1) if price_match else ""
    
    # Common nouns/topics
    topics = ['login', 'password', 'refund', 'invoice', 'dashboard', 'report', 'api', 'server', 'payment']
    found_topic = next((t for t in topics if t in text), "")
    
    return entity, found_topic

def analyze_ticket(user_ticket, previous_tickets=[]):
    ticket_text = user_ticket.lower()
    local_gen = load_generator()

    # 1. Entity Extraction for Personalization
    mention, topic = extract_entities(ticket_text)

    # 2. Categorization & Routing
    category = "General"
    assigned_team = "Support Team"
    
    billing_keywords = ['payment', 'refund', 'charge', 'billing', 'price', 'cost', 'invoice', 'subscription', 'credit card', 'transaction', 'overdue']
    tech_keywords = ['bug', 'error', 'crash', 'technical', 'api', 'server', 'broken', 'latency', 'slow', 'loading', 'integration', 'endpoint', 'timeout']
    account_keywords = ['login', 'password', 'account', 'access', 'reset', 'signup', 'profile', 'security', 'unauthorized', 'two-factor', '2fa', 'security question']

    if any(k in ticket_text for k in billing_keywords):
        category = "Billing"
        assigned_team = "Billing Team"
    elif any(k in ticket_text for k in tech_keywords):
        category = "Technical"
        assigned_team = "Technical Team"
    elif any(k in ticket_text for k in account_keywords):
        category = "Account"
        assigned_team = "Account Team"

    # 3. Sentiment & Tone Adjustment
    sentiment = "Neutral"
    tone_prefix = "Thank you for reaching out. "
    
    is_negative = any(k in ticket_text for k in ['angry', 'frustrated', 'bad', 'worst', 'hate', 'disappointed', 'terrible', 'furious', 'broken', 'failure'])
    is_positive = any(k in ticket_text for k in ['thanks', 'good', 'great', 'awesome', 'happy', 'love'])
    
    if is_negative:
        sentiment = "Negative"
        tone_prefix = "We sincerely apologize for the frustration this has caused. We are prioritizing your case. "
    elif is_positive:
        sentiment = "Positive"
        tone_prefix = "We appreciate your kind message! "

    # 4. Priority Calculation
    priority = "Low"
    if is_negative or any(k in ticket_text for k in ['urgent', 'emergency', 'asap', 'critical', 'panic']):
        priority = "High"

    # 5. Smart Personalization Templates
    # If we have a mention (like "1 ticket") and a topic, we use them
    context = ""
    if mention and topic: context = f" regarding {mention} for your {topic}"
    elif mention: context = f" regarding {mention}"
    elif topic: context = f" regarding the {topic} issue"

    templates = {
        "Billing": "{tone}Our billing team is reviewing your record{context}. We will resolve this within {time}.",
        "Technical": "{tone}Our engineering team is investigating the behavior{context}. We will update you in {time}.",
        "Account": "{tone}We are securing your account information{context}. A recovery guide will be sent in {time}.",
        "General": "{tone}Your request{context} has been routed to our support team for review within {time}."
    }
    
    res_time = "1-4 hours" if priority == "High" else "1-2 days"
    suggestion = templates.get(category, templates["General"]).format(tone=tone_prefix, context=context, time=res_time)

    # 6. GPT-2 Context-Aware Refinement
    if local_gen:
        try:
            # Better prompt for GPT-2: Giving it the template as a base to expand
            prompt = f"Customer Support Case: {user_ticket[:100]}\nResolution: {suggestion}\nRefined Professional Response:"
            gen_out = local_gen(prompt, max_new_tokens=50, num_return_sequences=1, truncation=True)
            candidate = gen_out[0]['generated_text'].split("Refined Professional Response:")[1].strip()
            candidate = candidate.split('\n')[0]
            if len(candidate) > 20:
                suggestion = candidate
        except Exception:
            pass

    return {
        "priority": priority,
        "sentiment": sentiment,
        "category": category,
        "reason": f"Detected {sentiment} sentiment and {category} context with specific mention of '{mention or topic}'.",
        "suggested_action": f"Immediate follow-up on {topic or 'general query'}.",
        "resolution_time": res_time,
        "assigned_team": assigned_team,
        "similar_issues": str(len(previous_tickets)),
        "ai_response": suggestion
    }
