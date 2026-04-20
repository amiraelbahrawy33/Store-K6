# Store K6 Performance Testing Framework

## Setup
1. Install k6: `brew install k6`
2. Clone repo: `git clone <url>`

## Running Tests
Run the login load test against the test environment:
`k6 run scripts/user_journey.js`

## Key Folders
- `/modules`: Shared business logic.
- `/config`: Environment configurations.
- `/data`: Test data.