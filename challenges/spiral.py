def spiralOrder(matrix: list[list[int]]) -> list[int]:
    UP_DIRECTION, DOWN_DIRECTION, LEFT_DIRECTION, RIGHT_DIRECTION = list(range(4))
    current_row = upper_row = 0
    bottom_row = len(matrix) - 1
    current_col = left_col = 0
    right_col = len(matrix[0]) - 1
    current_direction = RIGHT_DIRECTION  # horizontal direction    
    result = []

    while True:
        result.append(matrix[current_row][current_col])
        if current_direction == RIGHT_DIRECTION:
            if  current_col + 1 <= right_col:
                current_col += 1
            else:
                current_direction = DOWN_DIRECTION
                upper_row += 1
                current_row += 1
        elif current_direction == DOWN_DIRECTION:
            if current_row + 1 <= bottom_row:
                current_row += 1
            else:
                current_direction = LEFT_DIRECTION
                right_col -= 1
                current_col -= 1
        elif current_direction == LEFT_DIRECTION:
            if current_col - 1 >= left_col:
                current_col -= 1
            else:
                current_direction = UP_DIRECTION
                bottom_row -= 1
                current_row -= 1
        elif current_direction == UP_DIRECTION:
            if current_row - 1 >= upper_row:
                current_row -= 1
            else:
                current_direction = RIGHT_DIRECTION
                left_col += 1
                current_col += 1

        if not (upper_row <= current_row <= bottom_row and left_col <= current_col <= right_col):
            return result
        

print(spiralOrder([[1,2,3],[4,5,6],[7,8,9]]))