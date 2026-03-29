import sys
import os

# Add the project directory to path
sys.path.append('d:/ai-support-ticket-agent/ai-engine')

from ai_logic import analyze_ticket

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

print("--- AI ENGINE DEBUG RUN ---")
for i, case in enumerate(test_cases, 1):
    result = analyze_ticket(case)
    print(f"\n[{i}] Ticket: {case}")
    print(f"    Category:  {result['category']}")
    print(f"    Priority:  {result['priority']}")
    print(f"    Sentiment: {result['sentiment']}")
    print(f"    Team:      {result['assigned_team']}")
    print(f"    Summary:   {result['ai_summary']}")
    print(f"    Reason:    {result['reason']}")
