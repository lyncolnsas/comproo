import sys

file = r"src\app\dashboard\portal\page.tsx"

with open(file, "rb") as f:
    raw = f.read()

print(f"File size: {len(raw)} bytes")

# Each correct emoji: its UTF-8 bytes that are currently stored 
# in the file as a mojibake (corrupted latin-1->UTF-8 re-encoded) sequence.
# We detect and replace at the byte level.
# 
# Method: encode the correct emoji as UTF-8, then encode each byte as
# its latin-1 equivalent, then encode THAT as UTF-8 to get the bad bytes.
#
# Correct emoji -> its UTF-8 bytes -> each byte read as latin-1 char -> 
# that string encoded as UTF-8 = bad bytes in file

def make_bad_bytes(correct_char):
    """Get the mojibake UTF-8 bytes for a correctly-encoded unicode char."""
    good_utf8 = correct_char.encode('utf-8')
    # Each byte, treated as latin-1, then re-encoded as utf-8
    latin1_str = good_utf8.decode('latin-1')
    return latin1_str.encode('utf-8')

# All emojis that appear in this file
emojis_to_fix = [
    '\U0001f3a8',  # palette
    '\U0001f465',  # people (busts in silhouette)
    '\u2699\ufe0f',  # gear + variation selector
    '\U0001f4f8',  # camera with flash
    '\U0001f5bc\ufe0f',  # frame with picture
    '\U0001f4f9',  # video camera
    '\U0001f4fa',  # tv
    '\U0001f4f1',  # phone
    '\U0001f30d',  # globe europe-africa
    '\u26a0\ufe0f',  # warning
    '\U0001f4e4',  # outbox tray
    '\U0001f512',  # lock
    '\U0001f4e7',  # email
    '\u2705',      # white heavy check mark
    '\u2191',      # upward arrow
    '\u2193',      # downward arrow
    '\xb7',        # middle dot
]

total_fixed = 0
for ch in emojis_to_fix:
    bad = make_bad_bytes(ch)
    good = ch.encode('utf-8')
    if bad != good and bad in raw:
        count = raw.count(bad)
        raw = raw.replace(bad, good)
        total_fixed += count
        print(f"Fixed {count}x U+{ord(ch[0]):04X}: bad={len(bad)}B -> good={len(good)}B")

with open(file, "wb") as f:
    f.write(raw)

print(f"\nTotal: {total_fixed} fixes written.")
