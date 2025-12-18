def maxSubArray(nums: list[int]) -> int:
    max = 0
    for i in range(len(nums)):
        for j in range(i, len(nums)):
            lista = nums[i:j+1]
            partial_sum = sum(lista)
            if partial_sum > max:
                max = partial_sum
    return max

def newMaxSubArray(nums: list[int]) -> int:
    current_sum = nums[0]
    max_sum = nums[0]

    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)

    return max_sum

print(newMaxSubArray([-2,1,-3,4,-1,2,1,-5,4]))
print(newMaxSubArray([1]))
print(newMaxSubArray([5,4,-1,7,8]))