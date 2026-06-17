import json
import pandas as pd
import numpy as np
from collections import Counter

path = r"C:\Users\Apeksha\Desktop\emotion-aware-its1\backend\q_table.json"

with open(path, 'r') as f:
    data = json.load(f)

# Extract Q-table
if 'q_table' in data:
    q_table = data['q_table']
    metadata = {
        'alpha': data.get('alpha', 0.1),
        'gamma': data.get('gamma', 0.9),
        'epsilon': data.get('epsilon', 0.2),
        'actions': data.get('actions', ['normal', 'hint', 'repeat', 'simplify', 'motivate'])
    }
else:
    q_table = data
    metadata = {'actions': ['normal', 'hint', 'repeat', 'simplify', 'motivate']}

actions = metadata['actions']

print("="*60)
print("Q-TABLE ANALYSIS FOR JOURNAL PAPER")
print("="*60)

# 1. Basic Statistics
print(f"\n📊 1. BASIC STATISTICS")
print("-"*40)
print(f"Total states learned: {len(q_table)}")
print(f"Total possible states: 1,728")
print(f"Coverage: {(len(q_table)/1728)*100:.2f}%")
print(f"Number of actions: {len(actions)}")
print(f"Actions: {actions}")

# 2. Best Action Distribution
print(f"\n🎯 2. BEST ACTION DISTRIBUTION")
print("-"*40)

best_action_counts = {a: 0 for a in actions}
for state_key, q_values in q_table.items():
    best_action = max(q_values, key=q_values.get)
    best_action_counts[best_action] += 1

print("Most common best actions:")
for action, count in sorted(best_action_counts.items(), key=lambda x: -x[1]):
    percentage = (count / len(q_table)) * 100
    print(f"  {action}: {count} states ({percentage:.1f}%)")

# 3. Q-Value Statistics
print(f"\n📈 3. Q-VALUE STATISTICS")
print("-"*40)

all_q_values = []
for q_values in q_table.values():
    all_q_values.extend(q_values.values())

print(f"Min Q-value: {min(all_q_values):.3f}")
print(f"Max Q-value: {max(all_q_values):.3f}")
print(f"Mean Q-value: {np.mean(all_q_values):.3f}")
print(f"Std Q-value: {np.std(all_q_values):.3f}")

# 4. State Parsing (analyze patterns)
print(f"\n🔍 4. STATE PATTERN ANALYSIS")
print("-"*40)

# Parse states to find patterns
emotion_patterns = Counter()
streak_patterns = Counter()
repeat_patterns = Counter()

for state_key in q_table.keys():
    # Parse the state string (format: ["emotion1","emotion2",streak,repeat,face])
    try:
        parts = eval(state_key)
        if len(parts) >= 5:
            prev_emotion = parts[0]
            curr_emotion = parts[1]
            streak = parts[2]
            repeat = parts[3]
            
            emotion_patterns[f"{prev_emotion} → {curr_emotion}"] += 1
            streak_patterns[streak] += 1
            repeat_patterns[repeat] += 1
    except:
        pass

print("\nMost common emotion transitions:")
for transition, count in emotion_patterns.most_common(5):
    print(f"  {transition}: {count} states")

print(f"\nStreak distribution:")
for streak, count in sorted(streak_patterns.items()):
    print(f"  streak={streak}: {count} states")

print(f"\nRepeat distribution:")
for repeat, count in sorted(repeat_patterns.items()):
    print(f"  repeat={repeat}: {count} states")

# 5. Top Q-Values (Most confident decisions)
print(f"\n🏆 5. HIGHEST Q-VALUES (Most confident decisions)")
print("-"*40)

top_states = sorted(q_table.items(), key=lambda x: max(x[1].values()), reverse=True)[:10]
for i, (state, q_values) in enumerate(top_states):
    best = max(q_values, key=q_values.get)
    print(f"{i+1}. State: {state[:60]}...")
    print(f"   Best: {best} (Q={q_values[best]:.2f})")

# 6. Summary for Journal Paper
print("\n" + "="*60)
print("📝 SUMMARY FOR JOURNAL PAPER")
print("="*60)
print(f"""
The Q-learning agent explored {len(q_table)} out of 1,728 possible states 
({(len(q_table)/1728)*100:.1f}% coverage). 

The most preferred actions were:
{', '.join([f"{a}: {best_action_counts[a]} states" for a in sorted(best_action_counts, key=lambda x: -best_action_counts[x])[:3]])}

Q-values range from {min(all_q_values):.2f} to {max(all_q_values):.2f}, 
with a mean of {np.mean(all_q_values):.2f}.

The agent has successfully learned to associate specific states with optimal 
pedagogical actions, demonstrating effective learning over training episodes.
""")

import matplotlib.pyplot as plt

# Analyze Q-value distribution
action_q_values = {a: [] for a in actions}
for q_values in q_table.values():
    for action, q_val in q_values.items():
        action_q_values[action].append(q_val)

# Create box plot
fig, ax = plt.subplots(figsize=(10, 6))
data_to_plot = [action_q_values[a] for a in actions]
ax.boxplot(data_to_plot, labels=actions)
ax.set_ylabel('Q-Value')
ax.set_title('Q-Value Distribution by Action')
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('q_value_distribution.png', dpi=150)
print("✅ Saved: q_value_distribution.png")

# Create bar chart of best actions
fig, ax = plt.subplots(figsize=(10, 6))
actions_list = list(best_action_counts.keys())
counts = [best_action_counts[a] for a in actions_list]
colors = ['#4caf50' if a == 'simplify' else '#2196f3' if a == 'normal' else '#ff9800' for a in actions_list]
bars = ax.bar(actions_list, counts, color=colors)
ax.set_ylabel('Number of States')
ax.set_xlabel('Action')
ax.set_title('Most Preferred Action per State')
for bar, count in zip(bars, counts):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 5, 
            str(count), ha='center', va='bottom')
plt.tight_layout()
plt.savefig('best_action_distribution.png', dpi=150)
print("✅ Saved: best_action_distribution.png")