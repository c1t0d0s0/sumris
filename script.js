document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next-block-canvas');
    const nextCtx = nextCanvas.getContext('2d');

    const scoreElement = document.getElementById('score');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const downBtn = document.getElementById('down-btn');
    const restartBtnOver = document.getElementById('restart-btn-over');
    const restartBtnClear = document.getElementById('restart-btn-clear');
    const startBtn = document.getElementById('start-btn');
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameClearScreen = document.getElementById('game-clear-screen');
    const startScreen = document.getElementById('start-screen');

    const COLS = 10;
    const ROWS = 15;
    const INITIAL_BLOCK_COUNT = 7;

    let BLOCK_SIZE; // Make it dynamic

    const COLORS = [
        null, '#FF5733', '#33FF57', '#3357FF', '#FFFF33', '#FF33FF',
        '#33FFFF', '#FF9933', '#9933FF', '#33FF99'
    ];

    let board = [];
    let currentBlock = null;
    let nextBlock = null;
    let score = 0;
    let gameOver = false;
    let isAnimating = false;
    let blinkingBlocks = new Set();
    let gameLoop;
    let fallSpeed = 1000; // ms
    let isProcessingMove = false;

    function setAppHeight() {
        const doc = document.documentElement;
        doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    }


    function resizeCanvas() {
        const gameMain = document.querySelector('.game-main');
        const containerWidth = gameMain.clientWidth;
        const containerHeight = gameMain.clientHeight;

        // Calculate block size based on container dimensions
        const blockW = containerWidth / COLS;
        const blockH = containerHeight / ROWS;
        BLOCK_SIZE = Math.floor(Math.min(blockW, blockH));

        canvas.width = BLOCK_SIZE * COLS;
        canvas.height = BLOCK_SIZE * ROWS;
        
        const nextBlockCanvasEl = document.getElementById('next-block-canvas');
        const style = getComputedStyle(nextBlockCanvasEl);
        const nextBlockSize = parseInt(style.height, 10);
        nextCanvas.width = nextBlockSize;
        nextCanvas.height = nextBlockSize;
        
        draw(); // Redraw with new size
    }
    
    function createEmptyBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    function generateBlock() {
        const number = Math.floor(Math.random() * 9) + 1;
        return {
            x: Math.floor(COLS / 2) - 1,
            y: 0,
            number: number,
            color: COLORS[number]
        };
    }

    function isValidMove(block, newX, newY) {
        return (
            newX >= 0 &&
            newX < COLS &&
            newY < ROWS &&
            (board[newY] && board[newY][newX] === 0)
        );
    }
    
    function placeBlock(block) {
        if (!block) {
            isProcessingMove = false; // Failsafe to prevent the game from getting stuck
            return;
        };
        board[block.y][block.x] = block.number;

        handleClears().then(() => {
            if (gameOver) return;

            currentBlock = nextBlock;
            nextBlock = generateBlock();

            if (!isValidMove(currentBlock, currentBlock.x, currentBlock.y)) {
                endGame();
            }
            
            isProcessingMove = false; // All processing is done, un-lock game flow
        });
    }

    function animateAndClearBlocks(blocksToClear) {
        return new Promise(resolve => {
            isAnimating = true;
            let blinkCount = 0;
            const totalBlinks = 4; // Must be even to end in a visible state
            const blinkInterval = 100; // ms

            const blinker = setInterval(() => {
                blinkCount++;
                if (blinkingBlocks.size > 0) {
                    blinkingBlocks.clear();
                } else {
                    blinkingBlocks = new Set(blocksToClear);
                }
                drawBoard();

                if (blinkCount >= totalBlinks) {
                    clearInterval(blinker);
                    blinkingBlocks.clear();

                    blocksToClear.forEach(b => {
                        const [y, x] = b.split(',').map(Number);
                        board[y][x] = 0;
                    });

                    applyGravity();
                    draw();
                    isAnimating = false;
                    resolve(); // Resolve the promise when the animation and gravity are done
                }
            }, blinkInterval);
        });
    }

    async function handleClears() {
        let comboMultiplier = 1;

        while (!gameOver) {
            const { blocksToClear, scoreFromClear, isCrossClear } = findCompletes();
            if (blocksToClear.size === 0) {
                break; // No more clears, exit the loop
            }

            let currentTurnScore = scoreFromClear;
            
            if (isCrossClear) {
                currentTurnScore *= 3; // Cross clears are worth more
            }
            if (comboMultiplier > 1) {
                // Apply a bonus for the combo chain, making each subsequent clear more valuable
                currentTurnScore *= (comboMultiplier * 2); 
            }
            
            updateScore(currentTurnScore);

            await animateAndClearBlocks(blocksToClear);
            
            comboMultiplier++;
        }
        checkForGameClear(); // Check for a full clear only after the entire chain is done
    }

    function findCompletes() {
        const verticalBlocksToClear = new Set();
        const horizontalBlocksToClear = new Set();
        let verticalScore = 0;
        let horizontalScore = 0;

        // Vertical Check
        for (let x = 0; x < COLS; x++) {
            let currentSum = 0;
            let sumBlocks = [];
            for (let y = 0; y < ROWS; y++) {
                if (board[y][x] > 0) {
                    currentSum += board[y][x];
                    sumBlocks.push({ y, x });
                }

                if (board[y][x] === 0 || y === ROWS - 1) {
                    if (currentSum > 0 && currentSum % 10 === 0) {
                        verticalScore += currentSum * sumBlocks.length;
                        sumBlocks.forEach(b => verticalBlocksToClear.add(`${b.y},${b.x}`));
                    }
                    currentSum = 0;
                    sumBlocks = [];
                }
            }
        }

        // Horizontal Check
        for (let y = 0; y < ROWS; y++) {
            let currentSum = 0;
            let sumBlocks = [];
            for (let x = 0; x < COLS; x++) {
                if (board[y][x] > 0) {
                    currentSum += board[y][x];
                    sumBlocks.push({ y, x });
                }
                if (board[y][x] === 0 || x === COLS - 1) {
                    if (currentSum > 0 && currentSum % 10 === 0) {
                       horizontalScore += currentSum * sumBlocks.length;
                       sumBlocks.forEach(b => horizontalBlocksToClear.add(`${b.y},${b.x}`));
                    }
                    currentSum = 0;
                    sumBlocks = [];
                }
            }
        }

        const intersection = new Set([...verticalBlocksToClear].filter(b => horizontalBlocksToClear.has(b)));
        const isCrossClear = intersection.size > 0;
        
        const blocksToClear = new Set([...verticalBlocksToClear, ...horizontalBlocksToClear]);
        const scoreFromClear = verticalScore + horizontalScore;
        
        return { blocksToClear, scoreFromClear, isCrossClear };
    }
    
    function applyGravity() {
        for (let x = 0; x < COLS; x++) {
            let emptyRow = ROWS - 1;
            for (let y = ROWS - 1; y >= 0; y--) {
                if (board[y][x] > 0) {
                    [board[emptyRow][x], board[y][x]] = [board[y][x], board[emptyRow][x]];
                    emptyRow--;
                }
            }
        }
    }

    function checkForGameClear() {
        const isBoardEmpty = board.every(row => row.every(cell => cell === 0));
        if (isBoardEmpty) {
            document.getElementById('final-score').textContent = score;
            gameClearScreen.style.display = 'flex';
            clearInterval(gameLoop);
            gameOver = true;
        }
    }

    function updateScore(points) {
        score += points;
        scoreElement.textContent = score;
    }
    
    function drawBlock(ctx, block, blockSize = BLOCK_SIZE) {
        if (!block) return;
        const border = 2;

        // Draw the outer border by filling a rectangle with the block's color
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x * blockSize, block.y * blockSize, blockSize, blockSize);

        // Draw the inner black background for the number
        ctx.fillStyle = '#000';
        ctx.fillRect(
            block.x * blockSize + border,
            block.y * blockSize + border,
            blockSize - (border * 2),
            blockSize - (border * 2)
        );

        // Draw the number text in white
        ctx.fillStyle = '#fff';
        ctx.font = `${blockSize * 0.6}px ${getComputedStyle(document.body).fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(block.number, block.x * blockSize + blockSize / 2, block.y * blockSize + blockSize / 2);
    }
    
    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (board[y][x] > 0) {
                    const number = board[y][x];
                    const isBlinking = blinkingBlocks.has(`${y},${x}`);
                    const color = isBlinking ? '#FFFFFF' : COLORS[number]; // Blink to white
                    const tempBlock = { x, y, number, color };
                    drawBlock(ctx, tempBlock);
                }
            }
        }
    }
    
    function drawNextBlock() {
        nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        if (nextBlock) {
             const displayBlock = {
                ...nextBlock,
                x: 0,
                y: 0,
            };
             drawBlock(nextCtx, displayBlock, nextCanvas.width);
        }
    }
    
    function moveCurrentBlock(dx) {
        if (gameOver || !currentBlock || isAnimating || isProcessingMove) return;
        const newX = currentBlock.x + dx;
        if (isValidMove(currentBlock, newX, currentBlock.y)) {
            currentBlock.x = newX;
        }
    }
    
    function dropBlock() {
        if (gameOver || !currentBlock || isAnimating || isProcessingMove) return;
        const newY = currentBlock.y + 1;
        if (isValidMove(currentBlock, currentBlock.x, newY)) {
            currentBlock.y = newY;
        } else {
            isProcessingMove = true; // Lock the game
            const blockToPlace = currentBlock;
            currentBlock = null; // Clear current block before async operation
            placeBlock(blockToPlace);
        }
    }
    
    function update() {
        if (gameOver || isAnimating || isProcessingMove) return;
        dropBlock();
        draw();
    }
    
    function draw() {
        drawBoard();
        drawBlock(ctx, currentBlock);
        drawNextBlock();
    }

    function handleKeyPress(e) {
        if (gameOver || isAnimating || isProcessingMove) return;
        switch (e.key) {
            case 'ArrowLeft':
                moveCurrentBlock(-1);
                break;
            case 'ArrowRight':
                moveCurrentBlock(1);
                break;
            case 'ArrowDown':
                dropBlock(); // Speed up drop
                break;
        }
        draw();
    }
    
    function addInitialBlocks() {
        // Try to generate a valid initial board layout up to 10 times.
        for (let attempt = 0; attempt < 10; attempt++) {
            // In startGame, the board is already cleared. For retries, we must clear it.
            if (attempt > 0) {
                 board = createEmptyBoard();
            }

            for (let i = 0; i < INITIAL_BLOCK_COUNT; i++) {
                let placed = false;
                let placeAttempts = 0;
                while (!placed && placeAttempts < 100) { // Safety break for placement
                    const x = Math.floor(Math.random() * COLS);
                    let targetY = ROWS - 1;
                    while (targetY >= 0 && board[targetY][x] !== 0) {
                        targetY--;
                    }
                    if (targetY > ROWS - 6) { // Prevent stacking too high
                        board[targetY][x] = Math.floor(Math.random() * 9) + 1;
                        placed = true;
                    }
                    placeAttempts++;
                }
            }

            // If the generated board has no clears, we are done.
            if (findCompletes().blocksToClear.size === 0) {
                return; // Exit successfully
            }
        }
    }
    
    function endGame() {
        gameOver = true;
        clearInterval(gameLoop);
        gameOverScreen.style.display = 'flex';
    }

    function startGame() {
        gameOver = false;
        isProcessingMove = false;
        score = 0;
        updateScore(0);
        
        gameOverScreen.style.display = 'none';
        gameClearScreen.style.display = 'none';
        startScreen.style.display = 'none';
        
        board = createEmptyBoard();
        addInitialBlocks();

        currentBlock = generateBlock();
        nextBlock = generateBlock();
        
        clearInterval(gameLoop);
        gameLoop = setInterval(update, fallSpeed);
        
        draw();
    }

    function init() {
        window.addEventListener('resize', () => {
            setAppHeight();
            resizeCanvas();
        });
        setAppHeight(); // Set initial height

        // Delay the initial resize slightly to allow the browser to finalize the layout
        setTimeout(resizeCanvas, 50);

        // --- Touch Controls ---

        // Prevent pinch-to-zoom (most reliable method)
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // Mobile swipe controls
        let touchStartX = 0;
        let touchMoveX = 0;
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', (e) => {
            if (gameOver || isAnimating || e.touches.length !== 1) return;
            touchMoveX = e.touches[0].clientX;
            const diff = touchMoveX - touchStartX;
            if (Math.abs(diff) > BLOCK_SIZE) { // Use BLOCK_SIZE as threshold
                moveCurrentBlock(diff > 0 ? 1 : -1);
                touchStartX = touchMoveX; // Reset start position
            }
        }, { passive: true });


        // --- Keyboard and Button Controls ---
        document.addEventListener('keydown', handleKeyPress);
        leftBtn.addEventListener('click', () => moveCurrentBlock(-1));
        rightBtn.addEventListener('click', () => moveCurrentBlock(1));
        downBtn.addEventListener('click', () => {
            dropBlock();
            draw(); // Redraw immediately after manual drop
        });

        // --- Game State Buttons ---
        startBtn.addEventListener('click', startGame);
        restartBtnOver.addEventListener('click', startGame);
        restartBtnClear.addEventListener('click', startGame);
        
        // Don't start the game immediately, wait for the start button.
        drawBoard();
        drawNextBlock();
    }

    init();
});
