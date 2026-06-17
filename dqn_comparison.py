"""
Q-Learning vs DQN Comparison Experiment
"""

import requests
import time
import random
import matplotlib.pyplot as plt
import numpy as np

API_BASE = "http://localhost:8000/api/v1"

# Simulated learner profiles
LEARNER_PROFILES = {
    "fast": {"correct_prob": 0.85, "name": "Fast Learner"},
    "average": {"correct_prob": 0.65, "name": "Average Learner"},
    "slow": {"correct_prob": 0.45, "name": "Slow Learner"}
}

EMOTIONS = ["happy", "neutral", "sad", "frustrated", "surprise", "confused"]


def simulate_learner_response(correct_prob, action):
    """Simulate learner response to an action"""
    if action == "simplify":
        correct_prob += 0.15
    elif action == "hint":
        correct_prob += 0.10
    elif action == "repeat":
        correct_prob += 0.05
    elif action == "motivate":
        correct_prob += 0.03
    
    correct_prob = min(0.95, correct_prob)
    is_correct = random.random() < correct_prob
    
    # Simulate emotion based on outcome
    if is_correct:
        emotion = random.choice(["happy", "surprise", "neutral"])
    else:
        emotion = random.choice(["sad", "frustrated", "confused"])
    
    return is_correct, emotion


def run_algorithm_test(algorithm, profile, episodes=50, questions_per_episode=10):
    """Run test for a specific algorithm"""
    
    endpoint = "/rl-decision/" if algorithm == "q_learning" else "/dqn-decision/"
    update_endpoint = "/update-rl/" if algorithm == "q_learning" else "/dqn-update/"
    
    episode_rewards = []
    episode_success = []
    inference_times = []
    
    for episode in range(episodes):
        learner_state = {
            "prev_emotion": "neutral",
            "current_emotion": "neutral",
            "streak": 0,
            "repeat_count": 0,
            "face_present": True
        }
        
        episode_total_reward = 0
        episode_correct = 0
        episode_steps = 0
        
        for q in range(questions_per_episode):
            # Measure inference time
            start_time = time.time()
            
            # Get action from algorithm
            try:
                response = requests.post(f"{API_BASE}{endpoint}", json={
                    "prev_emotion": learner_state["prev_emotion"],
                    "current_emotion": learner_state["current_emotion"],
                    "streak": learner_state["streak"],
                    "repeat_count": learner_state["repeat_count"],
                    "face_present": learner_state["face_present"]
                }, timeout=5)
                action = response.json().get("action", "normal")
            except Exception as e:
                action = "normal"
            
            inference_time = (time.time() - start_time) * 1000  # ms
            inference_times.append(inference_time)
            
            # Simulate learner response
            is_correct, emotion = simulate_learner_response(profile["correct_prob"], action)
            
            # Calculate reward
            reward = 10 if is_correct else -5
            
            # Update learner state
            learner_state["prev_emotion"] = learner_state["current_emotion"]
            learner_state["current_emotion"] = emotion
            
            if is_correct:
                learner_state["streak"] += 1
                episode_correct += 1
            else:
                learner_state["streak"] = 0
            
            if action == "repeat":
                learner_state["repeat_count"] += 1
            else:
                learner_state["repeat_count"] = max(0, learner_state["repeat_count"] - 1)
            
            episode_total_reward += reward
            
            # Update algorithm
            try:
                requests.post(f"{API_BASE}{update_endpoint}", json={
                    "prev_emotion": learner_state["prev_emotion"],
                    "current_emotion": learner_state["current_emotion"],
                    "streak": learner_state["streak"],
                    "repeat_count": learner_state["repeat_count"],
                    "face_present": learner_state["face_present"],
                    "action": action,
                    "correct": is_correct
                }, timeout=5)
            except:
                pass
            
            episode_steps += 1
        
        episode_rewards.append(episode_total_reward)
        episode_success.append((episode_correct / questions_per_episode) * 100)
    
    return {
        "avg_reward": np.mean(episode_rewards[-20:]),
        "success_rate": np.mean(episode_success[-20:]),
        "std_reward": np.std(episode_rewards[-20:]),
        "inference_time_ms": np.mean(inference_times),
        "reward_history": episode_rewards,
        "success_history": episode_success
    }


def plot_q_vs_dqn_comparison(q_results, dqn_results):
    """Plot Q-Learning vs DQN comparison"""
    
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    
    # Success Rate Comparison
    profiles = list(q_results.keys())
    q_success = [q_results[p]["success_rate"] for p in profiles]
    dqn_success = [dqn_results[p]["success_rate"] for p in profiles]
    
    x = np.arange(len(profiles))
    width = 0.35
    
    axes[0, 0].bar(x - width/2, q_success, width, label='Q-Learning', color='#4caf50')
    axes[0, 0].bar(x + width/2, dqn_success, width, label='DQN', color='#2196f3')
    axes[0, 0].set_ylabel('Success Rate (%)')
    axes[0, 0].set_title('Success Rate Comparison')
    axes[0, 0].set_xticks(x)
    axes[0, 0].set_xticklabels(profiles)
    axes[0, 0].legend()
    axes[0, 0].set_ylim(0, 100)
    
    # Reward Comparison
    q_reward = [q_results[p]["avg_reward"] for p in profiles]
    dqn_reward = [dqn_results[p]["avg_reward"] for p in profiles]
    
    axes[0, 1].bar(x - width/2, q_reward, width, label='Q-Learning', color='#4caf50')
    axes[0, 1].bar(x + width/2, dqn_reward, width, label='DQN', color='#2196f3')
    axes[0, 1].set_ylabel('Average Reward')
    axes[0, 1].set_title('Average Reward Comparison')
    axes[0, 1].set_xticks(x)
    axes[0, 1].set_xticklabels(profiles)
    axes[0, 1].legend()
    
    # Learning Curves (Average Learner)
    avg_learner_q = q_results["average"]["success_history"]
    avg_learner_dqn = dqn_results["average"]["success_history"]
    
    axes[1, 0].plot(avg_learner_q, label='Q-Learning', color='#4caf50', linewidth=2)
    axes[1, 0].plot(avg_learner_dqn, label='DQN', color='#2196f3', linewidth=2)
    axes[1, 0].set_xlabel('Episode')
    axes[1, 0].set_ylabel('Success Rate (%)')
    axes[1, 0].set_title('Learning Curves (Average Learner)')
    axes[1, 0].legend()
    axes[1, 0].grid(True, alpha=0.3)
    
    # Inference Time
    q_time = np.mean([q_results[p]["inference_time_ms"] for p in profiles])
    dqn_time = np.mean([dqn_results[p]["inference_time_ms"] for p in profiles])
    
    axes[1, 1].bar(['Q-Learning', 'DQN'], [q_time, dqn_time], color=['#4caf50', '#2196f3'])
    axes[1, 1].set_ylabel('Inference Time (ms)')
    axes[1, 1].set_title('Inference Time Comparison')
    for i, v in enumerate([q_time, dqn_time]):
        axes[1, 1].text(i, v + 0.5, f'{v:.1f} ms', ha='center', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('ql_vs_dqn_comparison.png', dpi=150, bbox_inches='tight')
    print("✅ Saved: ql_vs_dqn_comparison.png")
    plt.close()


def main():
    """Run Q-Learning vs DQN comparison"""
    
    print("\n" + "="*70)
    print("🤖 Q-LEARNING vs DEEP Q-NETWORK (DQN) COMPARISON")
    print("="*70)
    
    print("\n⚠️ Note: This requires your backend to be running with DQN enabled.")
    print("Make sure torch is installed and DQN endpoints are available.\n")
    
    # Ask user if they want to run
    response = input("Run comparison? (y/n): ")
    if response.lower() != 'y':
        print("Skipping DQN comparison.")
        return
    
    q_results = {}
    dqn_results = {}
    
    for profile_name, profile in LEARNER_PROFILES.items():
        print(f"\n📊 Testing {profile['name']} with Q-Learning...")
        q_results[profile_name] = run_algorithm_test("q_learning", profile, episodes=30)
        
        print(f"📊 Testing {profile['name']} with DQN...")
        dqn_results[profile_name] = run_algorithm_test("dqn", profile, episodes=30)
    
    # Plot results
    plot_q_vs_dqn_comparison(q_results, dqn_results)
    
    # Print summary
    print("\n" + "="*70)
    print("📊 Q-LEARNING vs DQN - RESULTS SUMMARY")
    print("="*70)
    
    print(f"\n{'Metric':<25} {'Q-Learning':<15} {'DQN':<15}")
    print("-" * 55)
    
    avg_q_success = np.mean([q_results[p]["success_rate"] for p in LEARNER_PROFILES])
    avg_dqn_success = np.mean([dqn_results[p]["success_rate"] for p in LEARNER_PROFILES])
    print(f"{'Success Rate (Avg)':<25} {avg_q_success:>8.1f}%     {avg_dqn_success:>8.1f}%")
    
    avg_q_reward = np.mean([q_results[p]["avg_reward"] for p in LEARNER_PROFILES])
    avg_dqn_reward = np.mean([dqn_results[p]["avg_reward"] for p in LEARNER_PROFILES])
    print(f"{'Average Reward':<25} {avg_q_reward:>8.2f}     {avg_dqn_reward:>8.2f}")
    
    avg_q_time = np.mean([q_results[p]["inference_time_ms"] for p in LEARNER_PROFILES])
    avg_dqn_time = np.mean([dqn_results[p]["inference_time_ms"] for p in LEARNER_PROFILES])
    print(f"{'Inference Time (ms)':<25} {avg_q_time:>8.1f}     {avg_dqn_time:>8.1f}")
    
    # Per-profile breakdown
    print("\n" + "-" * 55)
    print(f"\n{'Learner Profile':<20} {'Algorithm':<15} {'Success Rate':<12}")
    print("-" * 55)
    for profile_name in LEARNER_PROFILES:
        print(f"{LEARNER_PROFILES[profile_name]['name']:<20} {'Q-Learning':<15} {q_results[profile_name]['success_rate']:>5.1f}%")
        print(f"{'':<20} {'DQN':<15} {dqn_results[profile_name]['success_rate']:>5.1f}%")
    
    print("\n✅ Results saved to: ql_vs_dqn_comparison.png")


if __name__ == "__main__":
    main()