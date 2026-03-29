import sys
sys.path.insert(0, 'd:/ai-support-ticket-agent/ai-engine')
from ai_logic import analyze_ticket

tests = [
    ("Overcharged for subscription", "I was charged twice this month and want a refund for $19.99 immediately."),
    ("API 500 error", "Server is down, production database returning 500 errors. Nothing is loading."),
    ("Forgot password", "I forgot my password and the reset link is not arriving. I cannot login."),
    ("Profile update", "How do I change my profile picture?"),
    ("Account hacked", "My account was hacked! Someone logged in from a different country."),
    ("Thank you", "Thank you so much for your help. You guys are amazing and did a great job!"),
]

print("=" * 75)
for title, desc in tests:
    r = analyze_ticket(f"{title}: {desc}")
    ok_cat = "OK" if r["category"] != "General" or title == "Profile update" else "FAIL"
    print(f"[{ok_cat}] {r['category']:<10} | {r['priority']:<8} | {r['sentiment']:<8} => {title}")
print("=" * 75)
