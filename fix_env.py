
import re
with open(".env", "r") as f:
    lines = f.readlines()
seen = set()
new_lines = []
for line in lines:
    if "=" in line:
        key = line.split("=")[0]
        if key in seen:
            continue
        seen.add(key)
    new_lines.append(line)
with open(".env", "w") as f:
    f.writelines(new_lines)

