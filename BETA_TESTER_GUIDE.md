# Cerebro Beta Testing Guide

Thanks for helping test Cerebro! Your feedback is invaluable.

## What is Cerebro?

Cerebro is a privacy-first cognitive self-tracking tool that helps you monitor your mental performance over time. It's **not a medical device** - just a personal tracking tool.

### What it measures:
- **Reaction Time**: How quickly you respond to visual stimuli
- **Speech Timing**: Your speaking rate, pauses, and fluency
- **Memory**: Short-term word recall ability

All data is compared to **your own baseline** (your first session), not to other people.

## Getting Started

### 1. Sign Up
Visit: `[YOUR-VERCEL-URL-HERE]`
- Create account with email + password
- Verify your email (check spam folder)

### 2. Complete Your First Session (~5 minutes)

The test has 4 parts:

1. **Memory Encoding** (10 seconds)
   - Remember a sequence of words
   - Pay attention - you'll recall these later!

2. **Reaction Time** (60 seconds)
   - Click when you see the green circle
   - Wait for it - don't click early!
   - 5 quick trials

3. **Memory Recall** (30 seconds)
   - Type the words you memorized
   - Spelling doesn't have to be perfect

4. **Speech Test** (60 seconds)
   - Read a passage aloud
   - Speak at your natural pace
   - Requires microphone permission

### 3. View Your Results

After completing your session:
- **Dashboard**: See your performance score (0-100)
- **History**: View all past sessions
- **Settings**: Change color theme

### 4. Track Progress

Complete **1 session per week** to:
- Build your personal baseline
- Track trends over time
- Maintain your weekly streak

## What We Need You to Test

### Essential Tests

- [ ] **Sign up process** - Any issues? Confusing steps?
- [ ] **Complete 2-3 sessions** - Does it work consistently?
- [ ] **Dashboard view** - Is the data clear and useful?
- [ ] **History page** - Can you understand your trends?
- [ ] **Settings** - Try changing themes

### Browser Testing

Test on at least 2 browsers:
- [ ] Chrome/Edge (recommended)
- [ ] Safari
- [ ] Firefox
- [ ] Mobile browser (if possible)

### Device Testing

- [ ] Desktop/Laptop
- [ ] Tablet (optional)
- [ ] Mobile phone (optional)

## Tips for Best Results

### Environment
- **Quiet room** - Background noise affects speech test
- **Good lighting** - Helps you focus
- **Stable internet** - Prevents disconnections

### Testing Schedule
- **Same time of day** - Reduces variability
- **Weekly consistency** - Better for tracking
- **Not when tired** - Results won't be representative

### Common Issues

**Can't hear the beep during reaction test**
- Check volume is up
- Make sure browser isn't muted

**Microphone not working**
- Browser will ask for permission - click "Allow"
- Check system microphone settings
- Chrome/Edge work best for audio

**Words not saving in memory test**
- Try typing them separated by spaces or commas
- Example: "apple tree house" or "apple, tree, house"

**Session taking too long**
- Should be ~4-6 minutes total
- If stuck, refresh and try again (progress will be lost)

## What to Report

### 🐛 Bugs to Report

Please screenshot and send:
1. What you were doing
2. What happened (vs what you expected)
3. Browser + device (e.g., "Chrome on MacBook")
4. Any error messages

**Examples:**
- "Dashboard shows NaN instead of score"
- "Can't click submit button on memory test"
- "Speech test gets stuck on 'Processing...'"

### 💡 Feedback Welcome

- Confusing instructions or UI
- Features you wish existed
- Things that feel broken or slow
- Design suggestions
- Accessibility issues

### 📧 How to Report

Send to: `[YOUR-EMAIL-HERE]`

Subject line: `Cerebro Beta - [Bug/Feedback]`

Include:
- Screenshot (if applicable)
- Browser + device
- Description

## Privacy & Data

### What data is collected?
- Your email (for login only)
- Test results (reaction times, speech metrics, memory scores)
- Session metadata (timestamps, browser type)

### What's NOT collected?
- Audio recordings (not stored by default)
- Personal information beyond email
- Location data
- Usage outside the app

### Who can see your data?
- **Only you** - Data is private to your account
- No cross-user comparisons
- No sharing with third parties

### Can you delete your data?
- Yes - Settings → Account → Delete Account
- Permanently removes all your data

## Understanding Your Results

### Performance Score (0-100)
- **100**: Matching or exceeding your baseline
- **90-100**: Excellent performance
- **80-90**: Good performance
- **70-80**: Slight decline
- **Below 70**: Notable decline

**Remember:** This is compared to YOUR baseline, not others.

### Score Breakdown
- **Reaction Time (50%)**: Speed + consistency
- **Speech Timing (30%)**: Words per minute + pause patterns
- **Memory (20%)**: Recall accuracy

### What affects your score?
- Time of day
- Sleep quality
- Stress level
- Environment (noise, distractions)
- Caffeine/medication

## FAQ

**Q: How often should I test?**
A: Once per week is ideal. More frequent testing can cause fatigue.

**Q: Can I test multiple times per day?**
A: You can, but the app will warn you. Daily testing isn't recommended.

**Q: What's a "good" score?**
A: Any score is fine! You're only compared to yourself. Watch for trends, not absolute numbers.

**Q: Is this a medical test?**
A: No. Cerebro is for personal tracking only. If you have health concerns, consult a doctor.

**Q: Can I share my results?**
A: Not yet, but we may add export features later.

**Q: Does it work offline?**
A: No, you need internet connection.

**Q: Can I skip the speech test?**
A: Yes, but your overall score won't be as accurate.

## Beta Testing Timeline

- **Week 1-2**: Initial testing and bug reports
- **Week 3-4**: Feature feedback and improvement suggestions
- **Week 5+**: Ongoing usage and trend tracking

## Thank You!

Your testing helps make Cerebro better for everyone. We appreciate your time and feedback!

Questions? Email: `[YOUR-EMAIL-HERE]`

---

**Version:** 1.0.0 Beta
**Last Updated:** [DATE]
