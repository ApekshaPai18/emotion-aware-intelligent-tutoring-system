"""
Complete RL Agent Analytics - All-in-One Graph Generator
Generates all graphs for PPT presentation
"""

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.patches import Patch

# Set style for professional look
plt.style.use('seaborn-v0-8-darkgrid')
plt.rcParams['font.sans-serif'] = ['Arial Unicode MS', 'SimHei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

# ============= DATA FROM YOUR FIGURE_4 =============
actions = ['Normal Teaching', 'Provide Hint', 'Repeat Lesson', 'Simplify Content', 'Motivational Message']
action_keys = ['normal', 'hint', 'repeat', 'simplify', 'motivate']

success_rates = [75.4, 48.0, 38.1, 88.2, 73.7]
usage_percent = [59.0, 12.5, 10.5, 8.5, 9.5]
avg_streak = [3.40, 1.52, 1.19, 3.41, 3.16]
avg_repeat = [1.07, 1.08, 0.67, 1.12, 1.05]

# Action colors for consistency
action_colors = {
    'Normal Teaching': '#2196f3',
    'Provide Hint': '#4caf50',
    'Repeat Lesson': '#ff9800',
    'Simplify Content': '#9c27b0',
    'Motivational Message': '#f44336'
}

# ============= EMOTION VS ACTION SUCCESS RATE MATRIX =============
# Based on your Figure_2 data
emotions = ['Happy', 'Neutral', 'Sad', 'Frustrated', 'Confused', 'Surprise']
success_matrix = np.array([
    [50, 30, 25, 70, 60],   # Happy
    [67, 55, 40, 80, 70],   # Neutral
    [100, 60, 50, 90, 85],  # Sad
    [75, 45, 35, 85, 75],   # Frustrated
    [0, 0, 0, 0, 0],        # Confused (no data)
    [0, 0, 0, 0, 0]         # Surprise (no data)
])

# ============= GRAPH 1: ACTION SUMMARY TABLE =============
def create_action_summary_table():
    """Create a professional summary table"""
    
    fig, ax = plt.subplots(figsize=(14, 4))
    ax.axis('tight')
    ax.axis('off')
    
    # Prepare table data
    table_data = []
    for i, action in enumerate(actions):
        table_data.append([
            action,
            f"{usage_percent[i]:.1f}%",
            f"{success_rates[i]:.1f}%",
            f"{avg_streak[i]:.2f}",
            f"{avg_repeat[i]:.2f}"
        ])
    
    # Create table
    table = ax.table(cellText=table_data,
                     colLabels=['RL Action', 'Usage', 'Success Rate', 'Avg Streak', 'Avg Repeat'],
                     cellLoc='center',
                     loc='center',
                     colWidths=[0.35, 0.12, 0.15, 0.12, 0.12])
    
    table.auto_set_font_size(False)
    table.set_fontsize(11)
    table.scale(1.2, 1.8)
    
    # Color code rows by success rate
    for i, rate in enumerate(success_rates):
        if rate >= 70:
            color = '#c8e6c9'  # Green for high success
        elif rate >= 50:
            color = '#fff9c4'  # Yellow for medium success
        else:
            color = '#ffcdd2'  # Red for low success
        
        for j in range(len(table_data[i])):
            table[(i+1, j)].set_facecolor(color)
    
    # Header styling
    for j in range(5):
        table[(0, j)].set_facecolor('#1976d2')
        table[(0, j)].set_text_props(weight='bold', color='white')
    
    ax.set_title('📊 RL Agent Action Performance Summary', fontsize=16, fontweight='bold', pad=20)
    
    plt.tight_layout()
    plt.savefig('01_rl_action_summary_table.png', dpi=300, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    plt.show()
    print("✅ Saved: 01_rl_action_summary_table.png")

# ============= GRAPH 2: SUCCESS RATE VS USAGE =============
def create_success_vs_usage_chart():
    """Bar chart comparing success rate and usage frequency"""
    
    fig, ax = plt.subplots(figsize=(12, 7))
    
    x = np.arange(len(actions))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, success_rates, width, label='Success Rate (%)', 
                   color='#4caf50', edgecolor='black', linewidth=1.5)
    bars2 = ax.bar(x + width/2, usage_percent, width, label='Usage (% of total)', 
                   color='#2196f3', edgecolor='black', linewidth=1.5)
    
    ax.set_xlabel('RL Actions', fontsize=13, fontweight='bold')
    ax.set_ylabel('Percentage (%)', fontsize=13, fontweight='bold')
    ax.set_title('🎯 Action Success Rate vs Usage Frequency', fontsize=16, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(actions, rotation=45, ha='right', fontsize=11)
    ax.legend(loc='upper left', fontsize=11)
    ax.grid(True, alpha=0.3, axis='y')
    ax.set_ylim(0, 100)
    
    # Add value labels
    for bar in bars1:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 1.5, f'{height:.1f}%', 
                ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    for bar in bars2:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 1.5, f'{height:.1f}%', 
                ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('02_rl_success_vs_usage.png', dpi=300, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    plt.show()
    print("✅ Saved: 02_rl_success_vs_usage.png")

# ============= GRAPH 3: AVERAGE STREAK BY ACTION =============
def create_streak_chart():
    """Bar chart showing impact on student streaks"""
    
    fig, ax = plt.subplots(figsize=(12, 7))
    
    colors = ['#4caf50' if rate >= 70 else '#ff9800' if rate >= 50 else '#f44336' 
              for rate in success_rates]
    
    bars = ax.bar(actions, avg_streak, color=colors, edgecolor='black', linewidth=2)
    ax.set_xlabel('RL Actions', fontsize=13, fontweight='bold')
    ax.set_ylabel('Average Streak Length', fontsize=13, fontweight='bold')
    ax.set_title('📈 Impact on Student Learning Streaks by Action', fontsize=16, fontweight='bold', pad=15)
    ax.set_xticklabels(actions, rotation=45, ha='right', fontsize=11)
    ax.grid(True, alpha=0.3, axis='y')
    
    # Add value labels
    for bar, streak in zip(bars, avg_streak):
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.1, 
                f'{streak:.2f}', ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    # Add legend
    legend_elements = [
        Patch(facecolor='#4caf50', label='High Success Rate (>70%)'),
        Patch(facecolor='#ff9800', label='Medium Success Rate (50-70%)'),
        Patch(facecolor='#f44336', label='Low Success Rate (<50%)')
    ]
    ax.legend(handles=legend_elements, loc='upper left', fontsize=10)
    
    plt.tight_layout()
    plt.savefig('03_rl_streak_impact.png', dpi=300, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    plt.show()
    print("✅ Saved: 03_rl_streak_impact.png")

# ============= GRAPH 4: EMOTION-ACTION HEATMAP =============
def create_emotion_action_heatmap():
    """Heatmap showing success rate by emotion and action"""
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Filter out rows/cols with no data
    valid_emotions = ['Happy', 'Neutral', 'Sad', 'Frustrated']
    valid_matrix = success_matrix[:4, :]
    
    im = ax.imshow(valid_matrix, cmap='RdYlGn', vmin=0, vmax=100, aspect='auto')
    
    ax.set_xticks(np.arange(len(actions)))
    ax.set_yticks(np.arange(len(valid_emotions)))
    ax.set_xticklabels(actions, rotation=45, ha='right', fontsize=11)
    ax.set_yticklabels(valid_emotions, fontsize=11)
    ax.set_xlabel('RL Actions', fontsize=13, fontweight='bold')
    ax.set_ylabel('Student Emotion', fontsize=13, fontweight='bold')
    ax.set_title('🔥 Success Rate by Emotion and RL Action (%)', fontsize=16, fontweight='bold', pad=15)
    
    # Add value labels
    for i in range(len(valid_emotions)):
        for j in range(len(actions)):
            if valid_matrix[i, j] > 0:
                text_color = 'white' if valid_matrix[i, j] < 30 or valid_matrix[i, j] > 70 else 'black'
                ax.text(j, i, f'{valid_matrix[i, j]:.0f}%',
                       ha="center", va="center", color=text_color, fontweight='bold', fontsize=11)
    
    # Add colorbar
    cbar = plt.colorbar(im, ax=ax, label='Success Rate (%)', shrink=0.8)
    cbar.ax.tick_params(labelsize=10)
    
    plt.tight_layout()
    plt.savefig('04_rl_emotion_action_heatmap.png', dpi=300, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    plt.show()
    print("✅ Saved: 04_rl_emotion_action_heatmap.png")

# ============= GRAPH 5: ACTION TRANSITION MATRIX =============
def create_transition_matrix():
    """Heatmap showing action transition probabilities"""
    
    # Transition matrix from your Figure_3 data
    transition_matrix = np.array([
        [66, 15, 10, 5, 4],   # Normal Teaching -> all
        [25, 56, 10, 5, 4],   # Provide Hint -> all
        [20, 15, 43, 12, 10], # Repeat Lesson -> all
        [15, 10, 8, 53, 14],  # Simplify Content -> all
        [10, 8, 7, 5, 70]     # Motivational Message -> all
    ])
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    im = ax.imshow(transition_matrix, cmap='Blues', vmin=0, vmax=100, aspect='auto')
    
    ax.set_xticks(np.arange(len(actions)))
    ax.set_yticks(np.arange(len(actions)))
    ax.set_xticklabels(actions, rotation=45, ha='right', fontsize=10)
    ax.set_yticklabels(actions, fontsize=10)
    ax.set_xlabel('Next Action', fontsize=13, fontweight='bold')
    ax.set_ylabel('Current Action', fontsize=13, fontweight='bold')
    ax.set_title('🔄 Action Transition Probabilities (%)', fontsize=16, fontweight='bold', pad=15)
    
    # Add value labels
    for i in range(len(actions)):
        for j in range(len(actions)):
            if transition_matrix[i, j] > 0:
                text_color = 'white' if transition_matrix[i, j] > 50 else 'black'
                ax.text(j, i, f'{transition_matrix[i, j]:.0f}%',
                       ha="center", va="center", color=text_color, fontweight='bold', fontsize=9)
    
    cbar = plt.colorbar(im, ax=ax, label='Transition Probability (%)', shrink=0.8)
    
    plt.tight_layout()
    plt.savefig('05_rl_transition_matrix.png', dpi=300, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    plt.show()
    print("✅ Saved: 05_rl_transition_matrix.png")

# ============= GRAPH 6: RADAR CHART FOR ACTION COMPARISON =============
def create_radar_chart():
    """Radar chart comparing multiple metrics for each action"""
    
    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(projection='polar'))
    
    metrics = ['Success Rate', 'Usage', 'Streak Impact', 'Repeat Reduction']
    num_vars = len(metrics)
    
    # Normalize data for radar chart
    normalized_data = []
    for i in range(len(actions)):
        normalized_data.append([
            success_rates[i] / 100,  # Success Rate (0-1)
            usage_percent[i] / 60,   # Usage (normalized to max 60%)
            avg_streak[i] / 4,       # Streak impact (max 4)
            1 - (avg_repeat[i] / 2)  # Repeat reduction (lower is better)
        ])
    
    angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()
    angles += angles[:1]
    
    for i, action in enumerate(actions):
        values = normalized_data[i]
        values += values[:1]
        ax.plot(angles, values, 'o-', linewidth=2, label=action, color=action_colors[action])
        ax.fill(angles, values, alpha=0.1, color=action_colors[action])
    
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(metrics, fontsize=11)
    ax.set_ylim(0, 1)
    ax.set_title('🌟 Multi-Metric Action Comparison', fontsize=16, fontweight='bold', pad=20)
    ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0), fontsize=10)
    ax.grid(True)
    
    plt.tight_layout()
    plt.savefig('06_rl_radar_chart.png', dpi=300, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    plt.show()
    print("✅ Saved: 06_rl_radar_chart.png")

# ============= GRAPH 7: ACTION RECOMMENDATION MATRIX =============
def create_recommendation_matrix():
    """Recommendation matrix based on emotion and context"""
    
    recommendations = {
        'Happy': {'best': 'Simplify Content', 'score': 70, 'avoid': 'Repeat Lesson'},
        'Neutral': {'best': 'Simplify Content', 'score': 80, 'avoid': 'Repeat Lesson'},
        'Sad': {'best': 'Simplify Content', 'score': 90, 'avoid': 'Repeat Lesson'},
        'Frustrated': {'best': 'Simplify Content', 'score': 85, 'avoid': 'Provide Hint'},
        'Struggling (streak=0)': {'best': 'Motivational Message', 'score': 73.7, 'avoid': 'Repeat Lesson'},
        'Good Progress (streak>3)': {'best': 'Normal Teaching', 'score': 75.4, 'avoid': 'Repeat Lesson'}
    }
    
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.axis('tight')
    ax.axis('off')
    
    table_data = []
    for context, rec in recommendations.items():
        table_data.append([
            context,
            rec['best'],
            f"{rec['score']:.1f}%",
            rec['avoid']
        ])
    
    table = ax.table(cellText=table_data,
                     colLabels=['Student Context', 'Recommended Action', 'Expected Success', 'Action to Avoid'],
                     cellLoc='center',
                     loc='center',
                     colWidths=[0.3, 0.3, 0.2, 0.2])
    
    table.auto_set_font_size(False)
    table.set_fontsize(11)
    table.scale(1.2, 1.8)
    
    # Style header
    for j in range(4):
        table[(0, j)].set_facecolor('#1976d2')
        table[(0, j)].set_text_props(weight='bold', color='white')
    
    # Color code recommendation rows
    for i in range(len(table_data)):
        table[(i+1, 1)].set_facecolor('#c8e6c9')  # Green for recommended
        table[(i+1, 3)].set_facecolor('#ffcdd2')  # Red for avoid
    
    ax.set_title('💡 RL Agent Action Recommendation Guide', fontsize=16, fontweight='bold', pad=20)
    
    plt.tight_layout()
    plt.savefig('07_rl_recommendation_guide.png', dpi=300, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    plt.show()
    print("✅ Saved: 07_rl_recommendation_guide.png")

# ============= GRAPH 8: SAMPLE Q-LEARNING CONVERGENCE =============
def create_q_learning_convergence():
    """Simulated Q-learning convergence curves"""
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    fig.suptitle('🧠 Q-Learning Agent Theoretical Convergence', fontsize=16, fontweight='bold')
    
    episodes = np.arange(1, 101)
    
    # Q-value convergence curves
    q_curves = {
        'Simplify Content': 85 - 50 * np.exp(-episodes / 25),
        'Normal Teaching': 78 - 55 * np.exp(-episodes / 30),
        'Motivational Message': 75 - 50 * np.exp(-episodes / 28),
        'Provide Hint': 58 - 45 * np.exp(-episodes / 20),
        'Repeat Lesson': 48 - 40 * np.exp(-episodes / 18)
    }
    
    for action, values in q_curves.items():
        ax1.plot(episodes, values, linewidth=2.5, label=action, 
                color=action_colors.get(action, 'gray'))
    
    ax1.set_xlabel('Training Episodes', fontsize=12)
    ax1.set_ylabel('Estimated Q-Value', fontsize=12)
    ax1.set_title('Q-Value Convergence by Action', fontsize=14, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    ax1.legend(loc='lower right', fontsize=10)
    ax1.set_ylim(0, 100)
    
    # Exploration vs Exploitation
    epsilon = np.exp(-episodes / 20)
    exploration = epsilon * 100
    exploitation = (1 - epsilon) * 100
    
    ax2.fill_between(episodes, 0, exploration, alpha=0.5, color='#ff9800', label='Exploration')
    ax2.fill_between(episodes, exploration, 100, alpha=0.5, color='#4caf50', label='Exploitation')
    ax2.plot(episodes, exploration, '--', color='#ff9800', linewidth=2)
    ax2.plot(episodes, exploitation, '--', color='#4caf50', linewidth=2)
    ax2.set_xlabel('Training Episodes', fontsize=12)
    ax2.set_ylabel('Ratio (%)', fontsize=12)
    ax2.set_title('Exploration vs Exploitation Balance', fontsize=14, fontweight='bold')
    ax2.set_ylim(0, 100)
    ax2.grid(True, alpha=0.3)
    ax2.legend(loc='upper right', fontsize=10)
    
    plt.tight_layout()
    plt.savefig('08_rl_q_learning_convergence.png', dpi=300, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    plt.show()
    print("✅ Saved: 08_rl_q_learning_convergence.png")

# ============= MAIN FUNCTION =============
def main():
    """Generate all graphs"""
    
    print("\n" + "="*70)
    print("🤖 RL AGENT ANALYTICS - COMPLETE GRAPH GENERATOR")
    print("="*70)
    print("\nGenerating 8 professional graphs for your PPT...\n")
    
    # Generate all graphs
    create_action_summary_table()
    create_success_vs_usage_chart()
    create_streak_chart()
    create_emotion_action_heatmap()
    create_transition_matrix()
    create_radar_chart()
    create_recommendation_matrix()
    create_q_learning_convergence()
    
    print("\n" + "="*70)
    print("✅ ALL GRAPHS GENERATED SUCCESSFULLY!")
    print("="*70)
    
    print("\n📁 Generated Files (8 images):")
    print("   1. 01_rl_action_summary_table.png - Summary statistics table")
    print("   2. 02_rl_success_vs_usage.png - Success rate vs usage bar chart")
    print("   3. 03_rl_streak_impact.png - Streak impact analysis")
    print("   4. 04_rl_emotion_action_heatmap.png - Emotion-action heatmap")
    print("   5. 05_rl_transition_matrix.png - Action transition matrix")
    print("   6. 06_rl_radar_chart.png - Multi-metric radar chart")
    print("   7. 07_rl_recommendation_guide.png - Action recommendation guide")
    print("   8. 08_rl_q_learning_convergence.png - Q-learning convergence")
    
    print("\n💡 For PPT Presentation:")
    print("   • Use Image 2 (Success vs Usage) - Best for showing effectiveness")
    print("   • Use Image 4 (Heatmap) - Best for emotion-action relationship")
    print("   • Use Image 7 (Recommendation Guide) - Best for actionable insights")
    print("   • Use Image 1 (Summary Table) - Best for detailed statistics")
    
    print("\n📊 Key Insights from Your Data:")
    print("   ✅ Simplify Content: Highest success (88.2%) but underutilized (8.5%)")
    print("   📈 Normal Teaching: Most used (59%) with good success (75.4%)")
    print("   💪 Motivational Message: Effective (73.7%) for struggling students")
    print("   ⚠️ Repeat Lesson: Lowest success (38.1%) - needs improvement")
    print("   🎯 Recommendation: Increase 'Simplify Content' usage for better outcomes")
    
    print("\n" + "="*70)

if __name__ == "__main__":
    main()