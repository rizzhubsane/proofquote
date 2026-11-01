# Test card

## Test 1: does the rule do what we claim? (run)

**We believe** the check passes every draft line that's on the list and stops every line that isn't.
**To verify**, we wrote 16 draft lines against the sample list: 7 on the list, 9 off it (lower GST slab, invented scheme, wrong HSN, shaved price three ways, rate borrowed from another item, validity the list doesn't give, freight term the list doesn't have).
**We measure** precision and recall of "on the list".
**We are right if** precision is 1.00. A false pass is the failure that matters.

**Result (2 Nov 2026, `npm run eval`):** precision 1.00, recall 1.00. 7 passed correctly, 9 stopped correctly, 0 wrong.

Limit: we wrote the lines and the rule, so this shows the rule is consistent, not that it holds on real drafts.

## Test 2: will a sales person use it? (not run yet)

**We believe** someone who has rebuilt a quote from WhatsApp will finish a checked quote faster than they'd finish one by hand, and will agree the flagged lines were wrong.
**To verify**, give 6–10 classmates who didn't build it a printed price list and a messy draft with two off-list lines. No help after the first sentence.
**We measure**
1. Finished: Send pressed with zero off-list lines.
2. Time to send, against their own estimate for doing it by hand.
3. Whether they agree each flagged line really wasn't on the list.

**We are right if** (set before testing) at least 60% finish, median time is under half their estimate, and at least 80% agree with the flags.

If this test isn't run before the presentation, the slide says "not run". No made-up numbers.
