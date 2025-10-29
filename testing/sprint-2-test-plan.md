Sprint 2

Introduction & Scope
This section outlines the specific test cases for the key user stories being developed in Sprint 2 of TrailTeller, the intelligent travel planning system.

The goal of these test cases is to ensure reliability, correctness, and usability for the new features being integrated — particularly those involving AI-based trip recommendations, itinerary generation, and budget management.
Project: TrailTeller
Author(s): Group 11
Date Created: October 22, 2025

Feature: AI-Based Trip Recommendation
User Story:
“As a traveler, I want the system to recommend destinations and dates based on my budget and preferences, so that I can easily plan an affordable and enjoyable trip.”

Test Case ID
Test Scenario / Description
Precondition
Test Steps
Expected Result
TT-001


Generate AI trip plan successfully (Happy Path)
User is logged in; Inputs provided (budget, dates, location).
1. Go to Trip Planner screen.
2. Enter budget 10,000 THB.
3. Select date June 11–16, 2025.
4. Choose Bangkok → Chiang Mai.
5. Click Generate Plan.
- System generates AI-based itinerary (flights, hotels, activities).
- Total cost shown in Budget Summary.
- Plan matches user’s preferences.
TT-002
Attempt to generate plan with missing budget (Sad Path)
User is logged in.
1. Open Trip Planner.
2. Leave budget field empty.
3. Click Generate Plan.
- Error message: “Budget is required to generate a plan.”
- No plan is generated.
TT-003


Invalid date range input (Sad Path)
User is logged in.
1. Select end date before start date.
2. Click Generate Plan.
- Error message: “Invalid date range. Please select valid travel dates.”
- No itinerary generated.
TT-004
AI-generated plan reflects updated preferences (Dynamic Update)
User has previously generated a plan.
1. Change budget to 15,000 THB.
2. Change destination to Phuket.
3. Click Regenerate Plan.
- Itinerary updates accordingly (new flights, hotels, activities).
- Costs are recalculated.





Feature: Interactive Itinerary Customization

Test Case ID
Test Scenario / Description
Precondition
Test Steps
Expected 
TT-005
Add or edit activities in itinerary (Happy Path)
AI itinerary already generated.
1. Open Plan Activities for Day 1.
2. Tap “+” to add activity “Visit Doi Suthep”.
3. Check existing activity as done.
4. Tap Next to update plan.
- New activity added and saved.
- Completed ones marked visually.
- Budget recalculates automatically.
TT-006
View Budget Summary (UI/UX)
Trip itinerary includes flights, hotels, and activities.
1. Tap Budget Summary at bottom of screen.
- Shows cost breakdown (Flights, Hotels, Activities).
- Shows total estimated cost.
- Buttons “Split Cost” & “Purchase” visible.





Feature: Secure Booking and Payment Integration

Test Case ID
Test Scenario / Description
Precondition
Test Steps
Expected Result
TT-007
Complete successful payment using Stripe (Happy Path)
Trip plan is finalized; User has valid card.
1. Click Purchase.
2. Enter valid card info.
3. Confirm payment.
- Payment processed successfully.
- Message: “Booking successful.”
- Booking status = “Confirmed.”
TT-008
Payment fails due to invalid card (Sad Path)
Trip plan is ready; User uses expired or incorrect card.
1. Click Purchase.
2. Enter invalid card info.
3. Confirm payment.
- Error message: “Payment failed. Please check your card details.”
- Booking remains “Pending.”
TT-009
Payment network timeout (Edge Case)
User has valid card; Internet unstable.
1. Click Purchase.
2. Wait until payment processing delays.
- Error message: “Connection timeout. Please try again.”
- No charge made; Booking not confirmed.
TT-0010
Verify booking record after payment
Successful transaction.
1. Go to User Profile → Bookings.
2. View last trip.
- Payment details appear correctly.
- Status: “Confirmed.”
- Flight/Hotel IDs linked properly in database.


