"""
Seed script — populates the database with 5 realistic meetings.
Each meeting has transcript segments, participants, summary, key topics,
and action items.

Usage: python seed.py
Works with or without GEMINI_API_KEY (uses mock fallback if no key).
"""

import sys
import os

# Add the backend directory to the path so imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
from db import engine, SessionLocal, Base
from models import (
    Meeting, Participant, TranscriptSegment,
    Summary, KeyTopic, ActionItem, Tag,
)
from services.ai_summary import generate_summary


def seed():
    """Drop all tables, recreate them, and populate with seed data."""
    print("🗑️  Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("📦 Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Create shared participants
        participants = create_participants(db)
        # Create tags
        tags = create_tags(db)
        # Create 5 meetings with full data
        create_meetings(db, participants, tags)
        db.commit()
        print("✅ Seed data created successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()


def create_participants(db) -> dict[str, Participant]:
    """Create a pool of participants that will be assigned to meetings."""
    people = [
        ("Alex Morgan", "alex.morgan@company.com"),
        ("Sarah Chen", "sarah.chen@company.com"),
        ("James Wilson", "james.wilson@company.com"),
        ("Priya Patel", "priya.patel@company.com"),
        ("Marcus Johnson", "marcus.johnson@company.com"),
        ("Emily Rodriguez", "emily.rodriguez@company.com"),
        ("David Kim", "david.kim@company.com"),
        ("Lisa Thompson", "lisa.thompson@company.com"),
    ]

    result = {}
    for name, email in people:
        p = Participant(name=name, email=email)
        db.add(p)
        result[name] = p

    db.flush()  # get IDs assigned
    print(f"👥 Created {len(result)} participants")
    return result


def create_tags(db) -> dict[str, Tag]:
    """Create tags for meeting categorization."""
    tag_names = ["Product", "Engineering", "Design", "Marketing", "Customer", "Planning"]
    result = {}
    for name in tag_names:
        tag = Tag(name=name)
        db.add(tag)
        result[name] = tag
    db.flush()
    print(f"🏷️  Created {len(result)} tags")
    return result


def create_meetings(db, participants: dict, tags: dict):
    """Create 5 realistic meetings with all related data."""
    now = datetime.utcnow()

    meetings_data = [
        {
            "title": "Q3 Product Roadmap Sync",
            "date": now - timedelta(days=2, hours=3),
            "duration_seconds": 2100,  # 35 min
            "participants": ["Alex Morgan", "Sarah Chen", "James Wilson", "Priya Patel"],
            "tags": ["Product", "Planning"],
            "segments": _roadmap_sync_segments(),
        },
        {
            "title": "Design Review — Onboarding Flow",
            "date": now - timedelta(days=5, hours=1),
            "duration_seconds": 1500,  # 25 min
            "participants": ["Sarah Chen", "Emily Rodriguez", "David Kim"],
            "tags": ["Design", "Product"],
            "segments": _design_review_segments(),
        },
        {
            "title": "Customer Feedback Debrief",
            "date": now - timedelta(days=8, hours=5),
            "duration_seconds": 2400,  # 40 min
            "participants": ["Alex Morgan", "Marcus Johnson", "Lisa Thompson", "Priya Patel"],
            "tags": ["Customer", "Product"],
            "segments": _customer_feedback_segments(),
        },
        {
            "title": "Engineering Standup — Sprint 14",
            "date": now - timedelta(days=12, hours=2),
            "duration_seconds": 900,  # 15 min
            "participants": ["James Wilson", "David Kim", "Priya Patel"],
            "tags": ["Engineering"],
            "segments": _engineering_standup_segments(),
        },
        {
            "title": "Marketing Launch Planning",
            "date": now - timedelta(days=18, hours=4),
            "duration_seconds": 1800,  # 30 min
            "participants": ["Marcus Johnson", "Emily Rodriguez", "Lisa Thompson"],
            "tags": ["Marketing", "Planning"],
            "segments": _marketing_launch_segments(),
        },
    ]

    for i, data in enumerate(meetings_data):
        print(f"📝 Creating meeting {i+1}/5: {data['title']}...")

        meeting = Meeting(
            title=data["title"],
            date=data["date"],
            duration_seconds=data["duration_seconds"],
        )
        db.add(meeting)

        # Add participants
        for name in data["participants"]:
            meeting.participants.append(participants[name])

        # Add tags
        for tag_name in data["tags"]:
            meeting.tags.append(tags[tag_name])

        db.flush()  # get meeting.id

        # Add transcript segments
        for idx, seg in enumerate(data["segments"]):
            segment = TranscriptSegment(
                meeting_id=meeting.id,
                speaker_name=seg["speaker"],
                start_time=seg["start"],
                end_time=seg["end"],
                text=seg["text"],
                order_index=idx,
            )
            db.add(segment)

        db.flush()

        # Generate summary, key topics, and action items using AI service
        segment_dicts = [
            {
                "speaker_name": seg["speaker"],
                "text": seg["text"],
                "start_time": seg["start"],
                "end_time": seg["end"],
            }
            for seg in data["segments"]
        ]

        ai_result = generate_summary(segment_dicts)

        # Add summary
        summary = Summary(
            meeting_id=meeting.id,
            overview_text=ai_result["summary"],
        )
        db.add(summary)

        # Add key topics
        for idx, topic in enumerate(ai_result["key_topics"]):
            kt = KeyTopic(
                meeting_id=meeting.id,
                topic_text=topic,
                order_index=idx,
            )
            db.add(kt)

        # Add action items (mix of completed/incomplete)
        for idx, item_text in enumerate(ai_result["action_items"]):
            # Parse assignee if present in format "... (assigned to Name)"
            assignee = None
            clean_text = item_text
            if "(assigned to " in item_text:
                parts = item_text.rsplit("(assigned to ", 1)
                clean_text = parts[0].strip()
                assignee = parts[1].rstrip(")")

            action = ActionItem(
                meeting_id=meeting.id,
                text=clean_text,
                assignee=assignee,
                is_completed=(idx % 3 == 0),  # ~1/3 completed
            )
            db.add(action)

    print(f"📝 Created {len(meetings_data)} meetings with transcripts, summaries, and action items")


# ---------------------------------------------------------------------------
# Transcript segment data for each meeting
# Each segment: {"speaker": str, "start": float, "end": float, "text": str}
# ---------------------------------------------------------------------------

def _roadmap_sync_segments():
    """Q3 Product Roadmap Sync — 35 min, 4 speakers, ~30 segments."""
    return [
        {"speaker": "Alex Morgan", "start": 0, "end": 45, "text": "Alright everyone, let's kick off our Q3 roadmap sync. I want to make sure we're all aligned on priorities before we finalize the plan next week."},
        {"speaker": "Sarah Chen", "start": 46, "end": 90, "text": "Sounds good. I've prepared a summary of the feature requests from the last quarter. The top three by customer demand are the dashboard redesign, API improvements, and the mobile notifications feature."},
        {"speaker": "James Wilson", "start": 91, "end": 140, "text": "From an engineering perspective, the API improvements should be straightforward. We've already done the groundwork in Sprint 12. I'd estimate about three weeks for the full overhaul."},
        {"speaker": "Priya Patel", "start": 141, "end": 195, "text": "That aligns with what I'm hearing from enterprise customers. They need better rate limiting and webhook support. Let's prioritize the API work for the first half of Q3."},
        {"speaker": "Alex Morgan", "start": 196, "end": 245, "text": "Agreed. Now for the dashboard redesign — Sarah, where are we on the mockups? I know the design team has been iterating on a few concepts."},
        {"speaker": "Sarah Chen", "start": 246, "end": 310, "text": "We have three concepts ready for review. I'll share them after this meeting. The main decision point is whether we go with the tabbed layout or the single-page scrollable design. Each has trade-offs for power users versus new users."},
        {"speaker": "James Wilson", "start": 311, "end": 365, "text": "I'd lean toward the tabbed approach. It'll be easier to maintain and we can lazy-load each section. Performance-wise, that's a big win for users with large datasets."},
        {"speaker": "Priya Patel", "start": 366, "end": 420, "text": "Customer feedback supports that too. Our power users have been asking for more customization in the dashboard. Tabs would let us add a customizable view later without a major refactor."},
        {"speaker": "Alex Morgan", "start": 421, "end": 475, "text": "Good points. Let's go with the tabbed approach as our baseline. Sarah, can you finalize the mockups by Friday and share them with the broader team?"},
        {"speaker": "Sarah Chen", "start": 476, "end": 510, "text": "I'll have them ready by Thursday actually. I'll send a Slack message once they're uploaded to Figma."},
        {"speaker": "Alex Morgan", "start": 511, "end": 560, "text": "Perfect. Now let's talk about the mobile notifications feature. This has been on the backlog for two quarters now. James, what's the technical lift here?"},
        {"speaker": "James Wilson", "start": 561, "end": 630, "text": "It's more complex than it looks. We need to set up push notification infrastructure — either Firebase Cloud Messaging or our own solution. I'd estimate five to six weeks including testing across iOS and Android."},
        {"speaker": "Priya Patel", "start": 631, "end": 685, "text": "That's a significant investment. But the data shows that users who enable notifications have 40% higher retention. I think it's worth prioritizing for mid-Q3."},
        {"speaker": "Alex Morgan", "start": 686, "end": 740, "text": "Let's slot it after the API work then. James, can you draft a technical spec for the notification system by next week? I want to review the architecture before we commit resources."},
        {"speaker": "James Wilson", "start": 741, "end": 780, "text": "Sure, I'll have a draft ready by next Wednesday. I'll include cost estimates for both the Firebase and self-hosted approaches."},
        {"speaker": "Sarah Chen", "start": 781, "end": 835, "text": "One thing to consider — we should coordinate the notification feature with the dashboard redesign. Users will want to configure their notification preferences from the new dashboard."},
        {"speaker": "Alex Morgan", "start": 836, "end": 880, "text": "Great point, Sarah. Let's make sure the design includes a notification settings panel. Priya, any other customer requests we should factor in?"},
        {"speaker": "Priya Patel", "start": 881, "end": 945, "text": "Yes, there's growing demand for an analytics export feature. Customers want to export their data as CSV or PDF reports. It came up in three enterprise deals last month."},
        {"speaker": "James Wilson", "start": 946, "end": 995, "text": "That's relatively simple to implement. We already have the data pipeline. It's mainly a frontend feature — adding export buttons and generating the files client-side or through a lightweight API endpoint."},
        {"speaker": "Alex Morgan", "start": 996, "end": 1045, "text": "Let's add that as a stretch goal for Q3. If we finish the three main features ahead of schedule, we can tackle exports. Does that work for everyone?"},
        {"speaker": "Sarah Chen", "start": 1046, "end": 1085, "text": "Works for me. I'll add it to the backlog with the appropriate priority level."},
        {"speaker": "Priya Patel", "start": 1086, "end": 1130, "text": "Agreed. I'll communicate the roadmap priorities to the sales team so they can set customer expectations for Q3 deliverables."},
        {"speaker": "Alex Morgan", "start": 1131, "end": 1185, "text": "Let's also talk about resource allocation. James, do you have enough engineers to handle the API work and the notification system in parallel?"},
        {"speaker": "James Wilson", "start": 1186, "end": 1250, "text": "We'll need to bring on one more backend engineer. I've been interviewing candidates and have two strong options. I should have a decision by the end of this week."},
        {"speaker": "Alex Morgan", "start": 1251, "end": 1310, "text": "That's good to hear. Let's make that hire a priority. Priya, any budget concerns with the additional headcount?"},
        {"speaker": "Priya Patel", "start": 1311, "end": 1365, "text": "No, we have room in the Q3 budget for one more engineer. I'll send the approved headcount request to HR today so we can move fast."},
        {"speaker": "Sarah Chen", "start": 1366, "end": 1420, "text": "On the design side, I'll need Emily's help with the dashboard mockups. She's currently on the marketing site refresh, but that should wrap up by next week."},
        {"speaker": "Alex Morgan", "start": 1421, "end": 1480, "text": "Okay, let's plan for Emily to transition to the dashboard project starting next Monday. Any other concerns or blockers before we wrap up?"},
        {"speaker": "James Wilson", "start": 1481, "end": 1530, "text": "Just one — we should decide on our testing strategy for the API changes. I'd like to set up automated integration tests before we start the overhaul."},
        {"speaker": "Alex Morgan", "start": 1531, "end": 1590, "text": "Absolutely. Let's allocate the first few days of the API sprint for test setup. Alright, I think we have a solid plan. Let me summarize the action items."},
        {"speaker": "Alex Morgan", "start": 1591, "end": 1680, "text": "Sarah will finalize dashboard mockups by Thursday. James will draft the notification tech spec by next Wednesday. Priya will send the headcount request to HR today. And I'll schedule a follow-up meeting for next Friday to review progress. Thanks everyone!"},
    ]


def _design_review_segments():
    """Design Review — Onboarding Flow — 25 min, 3 speakers, ~20 segments."""
    return [
        {"speaker": "Sarah Chen", "start": 0, "end": 55, "text": "Welcome to the design review for the new onboarding flow. I've been working on this for the past two weeks and I'm excited to walk you through the wireframes and prototype."},
        {"speaker": "Emily Rodriguez", "start": 56, "end": 105, "text": "I've been looking forward to this. The current onboarding has a 35% drop-off rate at the second step, so there's a lot of room for improvement."},
        {"speaker": "David Kim", "start": 106, "end": 155, "text": "From a technical standpoint, I want to make sure whatever we design is feasible within our current component library. We recently upgraded to the new design system."},
        {"speaker": "Sarah Chen", "start": 156, "end": 230, "text": "Good point, David. I've been designing with the new component library in mind. Let me share my screen. So, the first major change is we're moving from a five-step wizard to a three-step progressive disclosure pattern."},
        {"speaker": "Emily Rodriguez", "start": 231, "end": 290, "text": "Oh, I like that approach. Research shows that fewer steps correlate with higher completion rates. But how are we handling the information we collected in steps four and five?"},
        {"speaker": "Sarah Chen", "start": 291, "end": 360, "text": "Great question. We're deferring the team invitation and integration setup to a post-onboarding checklist. Users can complete those tasks from the dashboard at their own pace instead of blocking their first experience."},
        {"speaker": "David Kim", "start": 361, "end": 420, "text": "That's smart. We can track checklist completion and send reminder emails. I'll need to set up a simple state machine for the checklist progress tracking."},
        {"speaker": "Sarah Chen", "start": 421, "end": 490, "text": "Exactly. Now for step one, we have the account creation. I've simplified it to just email, name, and password. We're removing the company name and role fields from this step."},
        {"speaker": "Emily Rodriguez", "start": 491, "end": 545, "text": "What about social login? That could reduce friction significantly. Google and Microsoft SSO would cover most of our enterprise users."},
        {"speaker": "David Kim", "start": 546, "end": 600, "text": "I can implement Google OAuth relatively quickly. Microsoft SSO will take a bit longer because of the Azure AD configuration, but it's doable."},
        {"speaker": "Sarah Chen", "start": 601, "end": 660, "text": "Let's include Google SSO for the initial launch and add Microsoft in a follow-up sprint. Step two is the workspace setup — this is where users name their workspace and choose their primary use case."},
        {"speaker": "Emily Rodriguez", "start": 661, "end": 720, "text": "I love the use case selection. It lets us customize their initial dashboard layout. Are we thinking predefined templates based on the selection?"},
        {"speaker": "Sarah Chen", "start": 721, "end": 785, "text": "Yes, exactly. I have four templates: Sales Team, Engineering, Customer Success, and General. Each one pre-configures the dashboard widgets and default views."},
        {"speaker": "David Kim", "start": 786, "end": 840, "text": "I'll need to build a template system in the backend. It shouldn't be too complex — basically JSON configurations that map to dashboard layouts. I can have a prototype ready in about a week."},
        {"speaker": "Sarah Chen", "start": 841, "end": 900, "text": "Perfect. Step three is the first-run experience — a brief interactive tour highlighting key features. I've designed it as a series of tooltip overlays rather than a separate tutorial page."},
        {"speaker": "Emily Rodriguez", "start": 901, "end": 960, "text": "Tooltip tours work well. Can users skip or dismiss them? Some experienced users might find them annoying."},
        {"speaker": "Sarah Chen", "start": 961, "end": 1010, "text": "Yes, there's a skip button on every tooltip, and a 'Don't show again' option. We'll also store the tour completion state so it doesn't reappear."},
        {"speaker": "David Kim", "start": 1011, "end": 1075, "text": "For the tooltip system, I'll use our existing popover component. I should be able to wire up the tour logic with a simple state management approach. No need for a third-party library."},
        {"speaker": "Emily Rodriguez", "start": 1076, "end": 1140, "text": "This looks great overall, Sarah. My one concern is accessibility. Have we tested the color contrast ratios on the new step indicators? They look quite light in the mockup."},
        {"speaker": "Sarah Chen", "start": 1141, "end": 1200, "text": "Good catch. I'll run them through the contrast checker and adjust if needed. I'll also add proper ARIA labels to all the interactive elements in the onboarding flow."},
        {"speaker": "David Kim", "start": 1201, "end": 1260, "text": "Let's also plan for keyboard navigation throughout the flow. I'll make sure all form fields and buttons follow our accessibility guidelines."},
        {"speaker": "Sarah Chen", "start": 1261, "end": 1340, "text": "Absolutely. Let me summarize next steps: I'll update the mockups with accessibility fixes by Monday. David will prototype the template system and tooltip tour. Emily, can you set up the A/B test framework so we can compare the new flow against the current one?"},
        {"speaker": "Emily Rodriguez", "start": 1341, "end": 1400, "text": "I'll have the A/B test configured by Wednesday. We should aim for a 10% traffic split initially to minimize risk."},
        {"speaker": "David Kim", "start": 1401, "end": 1450, "text": "Sounds like a plan. I'll start on the backend work tomorrow and keep you both updated on progress in our daily standups."},
    ]


def _customer_feedback_segments():
    """Customer Feedback Debrief — 40 min, 4 speakers, ~35 segments."""
    return [
        {"speaker": "Alex Morgan", "start": 0, "end": 50, "text": "Thanks for joining this debrief. We've collected feedback from 50 customers over the past month, and I want to go through the key themes and figure out our response strategy."},
        {"speaker": "Marcus Johnson", "start": 51, "end": 110, "text": "I've organized the feedback into five categories: usability, performance, feature requests, pricing, and support quality. The biggest volume is in usability and feature requests."},
        {"speaker": "Lisa Thompson", "start": 111, "end": 170, "text": "That matches what I'm seeing in support tickets. We've had a 20% increase in tickets related to the search functionality. Users are saying it's too slow and the results aren't relevant enough."},
        {"speaker": "Priya Patel", "start": 171, "end": 225, "text": "Search is critical for enterprise customers. Two of our largest accounts mentioned it specifically as a potential reason they might evaluate competitors. We need to address this urgently."},
        {"speaker": "Alex Morgan", "start": 226, "end": 280, "text": "Agreed. Let's make search improvements a top priority. Marcus, what specific issues are customers reporting?"},
        {"speaker": "Marcus Johnson", "start": 281, "end": 355, "text": "Three main complaints: First, search takes too long — sometimes 10 to 15 seconds for large workspaces. Second, the results don't rank well — relevant items are buried. Third, there's no way to filter search results by date or type."},
        {"speaker": "Lisa Thompson", "start": 356, "end": 415, "text": "I can add that the support team has developed some workarounds we share with customers, but they're not ideal. Users shouldn't need workarounds for basic search."},
        {"speaker": "Alex Morgan", "start": 416, "end": 465, "text": "Absolutely not. Priya, can you work with the engineering team to get a search improvement sprint scheduled? I want a plan on my desk by next week."},
        {"speaker": "Priya Patel", "start": 466, "end": 520, "text": "I'll set up a meeting with James and the backend team tomorrow. We should look into Elasticsearch or a similar solution for better indexing and relevance scoring."},
        {"speaker": "Marcus Johnson", "start": 521, "end": 580, "text": "Moving to the next theme — several customers asked about collaborative features. Things like shared notes, team annotations on transcripts, and comment threads."},
        {"speaker": "Lisa Thompson", "start": 581, "end": 635, "text": "The collaboration requests are really growing. I'd say it's come up in about 30% of the feedback sessions. Teams want to work together on meeting outcomes, not just view them individually."},
        {"speaker": "Alex Morgan", "start": 636, "end": 690, "text": "That's a significant signal. Let's add collaborative features to the Q4 roadmap consideration. It's too late for Q3, but we should start planning now."},
        {"speaker": "Priya Patel", "start": 691, "end": 745, "text": "I agree. I'll draft a product brief for collaborative features and circulate it for feedback. We should also look at what competitors are doing in this space."},
        {"speaker": "Marcus Johnson", "start": 746, "end": 810, "text": "On the pricing front, we got mixed feedback. Smaller teams think we're too expensive. Enterprise customers generally think the pricing is fair but want more flexibility in plan tiers."},
        {"speaker": "Lisa Thompson", "start": 811, "end": 865, "text": "We've lost a few potential customers at the pricing page. They compare us to cheaper alternatives that have fewer features. Maybe we need a lighter starter plan."},
        {"speaker": "Alex Morgan", "start": 866, "end": 920, "text": "That's worth exploring. Let's do a competitive pricing analysis. Marcus, can you put together a comparison matrix of our pricing versus the top five competitors?"},
        {"speaker": "Marcus Johnson", "start": 921, "end": 965, "text": "I'll have that ready by Friday. I already have some data from the market research we did last quarter."},
        {"speaker": "Priya Patel", "start": 966, "end": 1025, "text": "We should also consider usage-based pricing for the starter tier. It reduces the barrier to entry and lets customers scale naturally as their usage grows."},
        {"speaker": "Alex Morgan", "start": 1026, "end": 1075, "text": "Good idea. Include that as an option in the analysis. Now, what about the performance feedback? Lisa, you mentioned support tickets."},
        {"speaker": "Lisa Thompson", "start": 1076, "end": 1145, "text": "Beyond search, the main performance complaint is about transcript loading. For meetings longer than an hour, the transcript page takes a while to load. We've had several tickets about this."},
        {"speaker": "Marcus Johnson", "start": 1146, "end": 1200, "text": "That's a pagination issue. We're loading the entire transcript at once. We should implement virtual scrolling or lazy loading for long transcripts."},
        {"speaker": "Priya Patel", "start": 1201, "end": 1255, "text": "I'll flag that for the engineering team as well. It's likely a quick win — virtual scrolling libraries are well-established and shouldn't take more than a sprint to implement."},
        {"speaker": "Alex Morgan", "start": 1256, "end": 1310, "text": "Let's bundle the transcript loading fix with the search improvements. They're related performance issues and the team can tackle them together."},
        {"speaker": "Lisa Thompson", "start": 1311, "end": 1375, "text": "One more theme I want to raise — support quality. We got positive feedback overall, but customers want faster response times for critical issues. Our current SLA is 24 hours for high-priority tickets."},
        {"speaker": "Alex Morgan", "start": 1376, "end": 1430, "text": "What response time are they expecting?"},
        {"speaker": "Lisa Thompson", "start": 1431, "end": 1485, "text": "Enterprise customers want a 4-hour SLA for critical issues. Some even asked about dedicated support channels. That would require expanding the support team."},
        {"speaker": "Priya Patel", "start": 1486, "end": 1545, "text": "We could offer a premium support tier as an add-on to our enterprise plan. That would cover the cost of additional support staff and give enterprise customers what they want."},
        {"speaker": "Alex Morgan", "start": 1546, "end": 1600, "text": "I like that approach. It's a revenue opportunity, not just a cost center. Lisa, can you draft a proposal for the premium support tier, including staffing needs and pricing?"},
        {"speaker": "Lisa Thompson", "start": 1601, "end": 1650, "text": "I'll have a draft proposal ready by next Tuesday. I'll include benchmarks from industry standards for enterprise SaaS support."},
        {"speaker": "Marcus Johnson", "start": 1651, "end": 1710, "text": "One last thing — several customers praised our transcript accuracy. That's a strong differentiator we should highlight more in our marketing materials."},
        {"speaker": "Alex Morgan", "start": 1711, "end": 1765, "text": "Great point. Let's make sure the marketing team knows about those testimonials. Marcus, can you compile the positive quotes and share them with the marketing team?"},
        {"speaker": "Marcus Johnson", "start": 1766, "end": 1810, "text": "Absolutely. I'll put together a testimonial document this week and send it over to Emily's team."},
        {"speaker": "Alex Morgan", "start": 1811, "end": 1880, "text": "Excellent. Let me recap our action items: Priya will schedule the search improvement sprint. Marcus will do the competitive pricing analysis by Friday. Lisa will draft the premium support proposal by Tuesday. And Marcus will compile customer testimonials. Let's reconvene in two weeks to check progress. Thanks everyone!"},
        {"speaker": "Priya Patel", "start": 1881, "end": 1920, "text": "Thanks Alex. I'll send calendar invites for the follow-up engineering meetings tomorrow."},
        {"speaker": "Lisa Thompson", "start": 1921, "end": 1955, "text": "Sounds good. I'll also start tracking the new feedback themes in our CRM so we have better data for the next debrief."},
    ]


def _engineering_standup_segments():
    """Engineering Standup — Sprint 14 — 15 min, 3 speakers, ~15 segments."""
    return [
        {"speaker": "James Wilson", "start": 0, "end": 40, "text": "Alright, let's do our Sprint 14 standup. We're on day three of the sprint. David, want to kick us off with your update?"},
        {"speaker": "David Kim", "start": 41, "end": 100, "text": "Sure. Yesterday I finished the database migration for the new user preferences table. It's deployed to staging and all tests are passing. Today I'm starting on the API endpoints for the preference settings."},
        {"speaker": "James Wilson", "start": 101, "end": 140, "text": "Nice work on getting the migration done early. Any blockers on the API work?"},
        {"speaker": "David Kim", "start": 141, "end": 195, "text": "One minor blocker — I need the final list of preference fields from Sarah's design specs. She said she'd have them by end of day today, so I'll work on the generic CRUD structure first and fill in the specific fields tomorrow."},
        {"speaker": "Priya Patel", "start": 196, "end": 260, "text": "My update — I've been working on the notification service refactor. The old code was sending notifications synchronously, which was causing timeout issues for users with large teams. I'm moving everything to a background job queue."},
        {"speaker": "James Wilson", "start": 261, "end": 305, "text": "That's been a pain point for a while. What queue system are you using?"},
        {"speaker": "Priya Patel", "start": 306, "end": 370, "text": "I'm using Celery with Redis as the broker. It's well-documented and we already have Redis running for our caching layer, so no new infrastructure needed. I should have the core implementation done by tomorrow."},
        {"speaker": "James Wilson", "start": 371, "end": 425, "text": "Great choice. Make sure to add proper error handling and retry logic. We don't want failed notifications to silently disappear."},
        {"speaker": "Priya Patel", "start": 426, "end": 480, "text": "Already on it. I'm implementing exponential backoff with a dead letter queue for permanently failed notifications. I'll also add monitoring alerts."},
        {"speaker": "James Wilson", "start": 481, "end": 540, "text": "Perfect. My update — I've been reviewing the security audit findings from last week. Most of the issues are minor, but there are two medium-severity items we need to address before the end of the sprint."},
        {"speaker": "David Kim", "start": 541, "end": 590, "text": "What are the security issues?"},
        {"speaker": "James Wilson", "start": 591, "end": 660, "text": "First, we need to add rate limiting to the authentication endpoints. Someone could theoretically brute-force passwords right now. Second, we need to sanitize user input in the search API to prevent SQL injection in a specific edge case."},
        {"speaker": "Priya Patel", "start": 661, "end": 710, "text": "I can take the rate limiting task. I'll use the same Redis instance we're using for the job queue. Should be straightforward with a token bucket algorithm."},
        {"speaker": "James Wilson", "start": 711, "end": 760, "text": "Thanks, Priya. I'll handle the SQL injection fix myself — it's a quick patch to the query builder. Let's aim to have both fixes merged by Friday."},
        {"speaker": "David Kim", "start": 761, "end": 815, "text": "Should we also add automated security scanning to our CI pipeline? That way we catch these issues before they make it to code review."},
        {"speaker": "James Wilson", "start": 816, "end": 880, "text": "Yes, that's a great idea. Let's add that as a Sprint 15 task. I'll create the ticket. Alright, I think we're good for today. Let's keep the momentum going and sync again tomorrow. Same time, same place."},
    ]


def _marketing_launch_segments():
    """Marketing Launch Planning — 30 min, 3 speakers, ~25 segments."""
    return [
        {"speaker": "Marcus Johnson", "start": 0, "end": 55, "text": "Let's plan the launch campaign for the new analytics dashboard. We have four weeks until the feature goes live, and I want to make sure we have a comprehensive marketing strategy in place."},
        {"speaker": "Emily Rodriguez", "start": 56, "end": 115, "text": "I've drafted an initial campaign timeline. I'm thinking we do a three-phase approach: teaser phase starting two weeks before launch, announcement day, and post-launch engagement."},
        {"speaker": "Lisa Thompson", "start": 116, "end": 175, "text": "That's a solid framework. For the teaser phase, we should leverage our existing user base. We could send sneak peek emails to power users and get them excited before the public announcement."},
        {"speaker": "Marcus Johnson", "start": 176, "end": 235, "text": "I like that. Let's also create some teaser content for social media. Short video clips showing the new dashboard in action — nothing too detailed, just enough to build curiosity."},
        {"speaker": "Emily Rodriguez", "start": 236, "end": 300, "text": "I can create those video clips. I'm thinking 15-second teasers for Instagram and Twitter, and a longer 60-second overview for LinkedIn. We should also prepare a blog post for the announcement."},
        {"speaker": "Lisa Thompson", "start": 301, "end": 355, "text": "For the blog post, I'd suggest focusing on the problem we're solving rather than just listing features. Something like 'How teams are spending 5 hours a week on manual reporting and how our new dashboard fixes that.'"},
        {"speaker": "Marcus Johnson", "start": 356, "end": 415, "text": "That's a compelling angle. Let's use customer data to back up those claims. I'll pull some usage statistics that show the pain points our users face with manual reporting."},
        {"speaker": "Emily Rodriguez", "start": 416, "end": 470, "text": "We should also prepare a press release for tech publications. I have contacts at TechCrunch and Product Hunt. A coordinated launch on Product Hunt could drive significant traffic."},
        {"speaker": "Lisa Thompson", "start": 471, "end": 530, "text": "Product Hunt is a great idea. We should time the launch for a Tuesday or Wednesday — those are the highest traffic days. And we need to prepare our team to be responsive in the comments section."},
        {"speaker": "Marcus Johnson", "start": 531, "end": 590, "text": "Let's target a Wednesday launch. I'll coordinate with the engineering team to make sure the feature is stable and deployed by the Monday before."},
        {"speaker": "Emily Rodriguez", "start": 591, "end": 650, "text": "For the email campaign, I'm planning three emails: teaser two weeks out, announcement on launch day, and a follow-up tutorial email one week after launch to drive adoption."},
        {"speaker": "Lisa Thompson", "start": 651, "end": 710, "text": "Add a fourth email — a case study email about two weeks after launch featuring early adopters. Nothing sells a product better than seeing real results from peers."},
        {"speaker": "Marcus Johnson", "start": 711, "end": 770, "text": "Good thinking. We'll need to identify some beta users willing to share their experience. I can reach out to three or four of our most engaged customers and ask if they'd participate."},
        {"speaker": "Emily Rodriguez", "start": 771, "end": 830, "text": "On the paid advertising front, I'll set up campaigns on Google Ads targeting 'meeting analytics' and 'team productivity' keywords. Budget-wise, I'm thinking $5,000 for the launch month."},
        {"speaker": "Lisa Thompson", "start": 831, "end": 885, "text": "That budget seems reasonable. Let's also allocate some budget for LinkedIn ads targeting decision-makers at mid-size companies. That's our sweet spot demographic."},
        {"speaker": "Marcus Johnson", "start": 886, "end": 940, "text": "Let's do $3,000 for Google and $2,000 for LinkedIn. We can adjust based on performance after the first week. Emily, can you set up tracking pixels and UTM parameters for all campaigns?"},
        {"speaker": "Emily Rodriguez", "start": 941, "end": 990, "text": "Already on my list. I'll set up a dedicated analytics dashboard — ironic, I know — to track all launch metrics. CTR, signups, feature adoption, the works."},
        {"speaker": "Lisa Thompson", "start": 991, "end": 1050, "text": "We should also prepare an FAQ document for the support team. When we launch a major feature, support tickets always spike. Having ready answers will help manage the volume."},
        {"speaker": "Marcus Johnson", "start": 1051, "end": 1105, "text": "Great point. Lisa, can you take the lead on that? Work with the product team to compile the most likely questions and answers."},
        {"speaker": "Lisa Thompson", "start": 1106, "end": 1155, "text": "Happy to. I'll have a draft FAQ ready two weeks before launch. That gives us time for the support team to review and suggest additions."},
        {"speaker": "Emily Rodriguez", "start": 1156, "end": 1215, "text": "One more thing — we should create a landing page specifically for the new dashboard feature. Separate from our main product page, so we can drive all campaign traffic there."},
        {"speaker": "Marcus Johnson", "start": 1216, "end": 1275, "text": "Yes, absolutely. A dedicated landing page with a clear CTA — either 'Start Free Trial' or 'Upgrade to See Dashboard.' Emily, can you design and build that page?"},
        {"speaker": "Emily Rodriguez", "start": 1276, "end": 1330, "text": "I'll have a first draft ready by next Friday. I'll use our existing landing page template and customize it with dashboard screenshots and feature highlights."},
        {"speaker": "Lisa Thompson", "start": 1331, "end": 1385, "text": "Should we offer any launch incentives? Like a discount for users who upgrade during the first week? That could accelerate adoption."},
        {"speaker": "Marcus Johnson", "start": 1386, "end": 1450, "text": "Let's do a 20% discount for the first month for users who upgrade during launch week. I'll clear that with finance. Alright, let me summarize what everyone needs to do."},
        {"speaker": "Marcus Johnson", "start": 1451, "end": 1550, "text": "Emily will create the teaser videos, landing page, and set up ad campaigns. Lisa will prepare the FAQ and support documentation. I'll pull usage data, coordinate with engineering on timing, and reach out to beta customers for the case study. Let's reconvene next week to check progress. Great meeting, team!"},
    ]


if __name__ == "__main__":
    seed()
