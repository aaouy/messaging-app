def helper(nums):
    nums.sort()
    dp = [[num] for num in nums]
    res = [nums[-1]]
    for i in range(len(nums) - 2, -1, -1):
        for j in range(i + 1, len(nums)):
            if dp[j][0] % nums[i] == 0 and len([nums[i]] + dp[j]) > len(dp[i]):
                dp[i] = [nums[i]] + dp[j]
        res = max(dp[i], res, key=len)
        print(res)
    return res

nums = [4, 8, 10, 240]
helper(nums)
