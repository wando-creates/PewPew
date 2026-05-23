const canvas = document.
    querySelector('canvas');
const c = canvas.getContext('2d')

// screen state variables 
const startScreen = document.getElementById('start-screen')
const endScreen = document.getElementById('end-screen')
const startBtn = document.getElementById('start-btn')
const restartBtn = document.getElementById('restart-btn')
const finalScoreEl = document.getElementById('final-score')

// start->play state
startBtn.addEventListener('click', () => {
    stateSound.play()
    startScreen.style.display = "none"
    startGame()
})

// Play again 
restartBtn.addEventListener("click", () => {
    stateSound.play()
    endScreen.style.display = "none"
    startGame()
})

canvas.width = innerWidth
canvas.height = innerHeight

class Player {
    constructor(x,y,radius,colour) {
        this.x = x
        this.y = y
        this.radius = radius
        this.colour = colour
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.colour
        c.fill()
    }
    
}

class Projectile {
    constructor(x,y,radius,colour,velocity) {
        this.x=x
        this.y=y
        this.radius=radius
        this.colour=colour
        this.velocity=velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.colour
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy{
    constructor(x,y,radius,colour,velocity) {
        this.x=x
        this.y=y
        this.radius=radius
        this.colour=colour
        this.velocity=velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.colour
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99
class Particle{
    constructor(x,y,radius,colour,velocity) {
        this.x=x
        this.y=y
        this.radius=radius
        this.colour=colour
        this.velocity=velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.colour
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x * friction
        this.velocity.y * friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width/2
const y = canvas.height/2

const shootSound = new Audio('./sounds/upgrade.mp3')
const damageSound = new Audio('./sounds/laser.mp3')
const stateSound = new Audio('./sounds/state_change.mp3')

const player = new Player(x,y, 15, "white")
let score = 0
let projectiles = []
let enemies = []
let particles = []

function spawnEnemies() {
    spawnInterval = setInterval(() => {
        const radius = Math.random() * (60 - 15) + 15

        let x
        let y

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }

        const colour = `hsl(${Math.random() * 360}, 80%, 50%)`
        const angle = Math.atan2(
            -y+canvas.height/2,
            -x+canvas.width/2)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x,y,radius,colour,velocity))
    }, 1000)

}
let animationID
function animate() {
    animationID = requestAnimationFrame(animate)
    c.fillStyle = "rgba(0, 0, 0, 0.1)"
    c.fillRect(0,0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
        particle.update()
        }
    })
    projectiles.forEach((projectile, index) =>
        {
            projectile.update()
            if (projectile.x + projectile.radius < 0 ||
                projectile.x - projectile.radius > canvas.width ||
                projectile.y + projectile.radius < 0 ||
                projectile.y - projectile.radius > canvas.height
            ) {
                setTimeout(() => {
                    projectiles.splice(index, 1)
                }, 0)
            }
        }
    )

    enemies.forEach((enemy, index) => {
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        if (dist - enemy.radius - player.radius < 1)
        {
            gameOver()
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            if (dist - enemy.radius - projectile.radius < 1)
            {
                damageSound
                for (let i=0; i < enemy.radius; i++) {
                    particles.push(new Particle(
                        projectile.x, 
                        projectile.y, 
                        Math.random() * 2,
                        enemy.colour, 
                        {x: (Math.random() -0.5) * (Math.random() * (6)),
                        y: (Math.random() - 0.5) * (Math.random() *(6))}
                    ))
                }

                if (enemy.radius - 15 > 15) {
                    enemy.radius -= 15
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                } else {
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }


            }
        })
    })
}

function startGame() {
    //reset
    score = 0
    projectiles = []
    enemies = []
    particles = []

    animate()
    spawnEnemies()
}

function gameOver() {
    cancelAnimationFrame(animationID)
    clearInterval(spawnInterval)

    // end screen
    finalScoreEl.textContent = score
    endScreen.style.display = "flex"
}

addEventListener('click', (event) => 
    {
    damageSound.currentTime = 0
    damageSound.play()
    const angle = Math.atan2(
        event.clientY -canvas.height/2,
        event.clientX-canvas.width/2)
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(
        canvas.width/2, canvas.height/2,5,"white", 
        velocity)
    )
})


animate()
spawnEnemies() 