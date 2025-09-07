'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  CheckCircle, 
  Brain,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import QuestionCard from '@/components/QuestionCard'
import ProgressBar from '@/components/ProgressBar'

interface LearningContent {
  content: string
  questions: Array<{
    id: string
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }>
  nextSteps: string[]
  estimatedDuration: number
}

interface UserAnswer {
  questionId: string
  answer: number
  timeSpent: number
}

// Function to format markdown-like content to HTML
const formatContent = (content: string): string => {
  let formatted = content
    // Code blocks first (before other replacements)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg my-4 overflow-x-auto"><code class="text-sm">$2</code></pre>')
    
    // Headers
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium text-gray-700 mb-3 mt-6">$1</h3>')
    
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>')
    
    // Lists - handle them better
    .replace(/^- (.*$)/gm, '<li class="flex items-start mb-2"><span class="text-blue-500 mr-2">•</span><span>$1</span></li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="flex items-start mb-2"><span class="text-blue-500 mr-2 font-medium">$1.</span><span>$2</span></li>')
    
    // Convert line breaks to proper spacing
    .replace(/\n\n/g, '|||PARAGRAPH|||')
    .replace(/\n/g, ' ')
    .replace(/\|\|\|PARAGRAPH\|\|\|/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
    
  // Wrap the content and clean up
  formatted = '<div class="prose-custom">' + 
    '<p class="mb-4 text-gray-700 leading-relaxed">' + formatted + '</p>' +
    '</div>'
    
  return formatted
    .replace(/<p class="mb-4 text-gray-700 leading-relaxed"><\/p>/g, '')
    .replace(/<p class="mb-4 text-gray-700 leading-relaxed"><h/g, '<h')
    .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
}

export default function LearnModulePage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.moduleId as string

  const [currentStep, setCurrentStep] = useState<'content' | 'questions' | 'complete'>('content')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [learningContent, setLearningContent] = useState<LearningContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionTime, setSessionTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    // Simulate loading learning content based on module ID
    setTimeout(() => {
      const contentMap: { [key: string]: LearningContent } = {
        '1': {
        content: `# Introduction to Machine Learning

## What is Machine Learning?

ML, or Machine Learning, is a subset of Artificial Intelligence (AI) that uses data to train algorithms to learn, improve, and make predictions or decisions without being explicitly programmed for every task. ML systems learn from experience, analyze patterns in data, and continuously adapt to improve their performance as they process more information, leading to applications like fraud detection, personalized recommendations, and self-driving vehicles.

## How ML Works

**Data-Driven Learning:**
ML algorithms are trained by feeding them large datasets.

**Pattern Recognition:**
The algorithms identify patterns, correlations, and structures within the data.

**Model Training:**
A "model" is created from these patterns, which can then make predictions or generate content.

**Continuous Improvement:**
As the model encounters new data or receives feedback, it can adjust and refine its internal parameters, becoming more accurate over time.

## Key Applications of ML

**Personalization:**
Recommending products, music, or movies based on user preferences (e.g., on Netflix or Amazon).

**Automation:**
Automating complex tasks like customer service through chatbots, transcription, or translation.

**Analysis:**
Detecting fraud in financial transactions or identifying security threats.

**Predictive Analytics:**
Forecasting weather, predicting product demand, or estimating traffic delays.

**Image & Language Recognition:**
Recognizing objects in images or processing and understanding human language (Natural Language Processing).

## Why ML is Important

**Handling Big Data:**
ML makes it possible to analyze and extract value from the enormous amounts of data generated today.

**Enhanced Decision-Making:**
It provides data-driven insights to help businesses and individuals make smarter, more informed decisions.

**Innovation:**
ML opens up new possibilities for human-computer interaction, enabling revolutionary technologies like self-driving cars and personalized medicine.

## Relationship with AI and Deep Learning

Artificial Intelligence (AI) is the broad field aiming to create smart machines, Machine Learning (ML) is a subset of AI that uses algorithms to learn from data without explicit programming, and Deep Learning (DL) is a specialized subfield of ML that employs multi-layered neural networks to solve complex problems by learning hierarchical data representations. You can visualize their relationship as nested dolls, with AI as the largest concept, ML within AI, and DL within ML.

## Core ML Concepts

**Supervised Learning:**
- **Data Type**: Employs labeled data, meaning each input in the training dataset is associated with a corresponding correct output or "label."
- **Objective**: To learn a mapping function from input features to output labels, enabling the model to predict outcomes for new, unseen data.
- **Tasks**: Classification (categorizing data into predefined classes like spam detection, image recognition) and Regression (predicting continuous numerical values like house prices, stock forecasting).
- **Examples**: Linear Regression, Logistic Regression, Support Vector Machines (SVMs), Decision Trees, Random Forests, K-Nearest Neighbors (KNN).

**Unsupervised Learning:**
- **Data Type**: Works with unlabeled data, meaning the training data lacks predefined output labels.
- **Objective**: To discover hidden patterns, structures, or relationships within the data without explicit guidance.
- **Tasks**: Clustering (grouping similar data points for customer segmentation), Dimensionality Reduction (reducing features while preserving information using PCA), and Anomaly Detection (identifying unusual data points for fraud detection).
- **Examples**: K-Means Clustering, Hierarchical Clustering, Principal Component Analysis (PCA), Independent Component Analysis (ICA).`,
        questions: [
          {
            id: 'q1',
              question: 'According to the relationship between AI, ML, and DL, which statement is correct?',
            options: [
                'Deep Learning is a subset of Machine Learning, which is a subset of AI',
                'Machine Learning and Deep Learning are separate fields from AI',
                'AI is a subset of Machine Learning',
                'All three terms mean exactly the same thing'
            ],
            correctAnswer: 0,
              explanation: 'The relationship is like nested dolls: AI is the broadest field, ML is a subset of AI, and DL is a specialized subfield within ML that uses neural networks.'
          },
          {
            id: 'q2',
              question: 'What makes Machine Learning different from traditional programming?',
            options: [
                'ML requires more computational power',
                'ML learns from data and improves over time without explicit programming for every task',
                'ML only works with numerical data',
                'ML is faster than traditional programming'
              ],
              correctAnswer: 1,
              explanation: 'Unlike traditional programming where we write explicit instructions, ML systems learn from data, identify patterns, and continuously adapt to improve their performance.'
            }
          ],
          nextSteps: [
            'Learn Python basics for data science',
            'Explore scikit-learn library',
            'Practice with real datasets',
            'Build your first ML project'
          ],
          estimatedDuration: 15
        },
        '2': {
          content: `# Climate Change & Sustainability

## What is Climate Change?

Climate change refers to long-term shifts in global temperatures and weather patterns. While climate variations occur naturally, scientific evidence shows that human activities since the 1800s have been the main driver of climate change, primarily through burning fossil fuels like coal, oil, and gas, which produces greenhouse gas emissions.

## The Greenhouse Effect Explained

**Natural Greenhouse Effect:**
Earth's atmosphere naturally traps some heat from the sun, keeping our planet warm enough to support life. This process involves greenhouse gases like water vapor, carbon dioxide (CO2), methane (CH4), and nitrous oxide (N2O).

**Enhanced Greenhouse Effect:**
Human activities have dramatically increased greenhouse gas concentrations, intensifying the natural greenhouse effect and causing global warming. The main sources include:
- **Fossil Fuel Combustion**: Coal, oil, and natural gas for electricity, heat, and transportation
- **Deforestation**: Reducing Earth's capacity to absorb CO2
- **Industrial Processes**: Manufacturing, cement production, chemical processes
- **Agriculture**: Livestock farming (methane), rice cultivation, fertilizer use

## Current Climate Impacts

**Temperature Changes:**
Global average temperatures have risen by approximately 1.1°C (2°F) since the late 1800s, with the last decade being the warmest on record.

**Extreme Weather Events:**
- More frequent and intense heatwaves, droughts, and wildfires
- Stronger hurricanes and storms
- Increased flooding and precipitation variability

**Ice and Sea Level Changes:**
- Arctic sea ice declining at 13% per decade
- Greenland and Antarctic ice sheets losing mass
- Global sea levels rising 3.3mm per year

**Ecosystem Disruption:**
- Coral reef bleaching and ocean acidification
- Shifting wildlife habitats and migration patterns
- Threats to biodiversity and species extinction

## Sustainable Solutions

**Renewable Energy Transition:**
- **Solar Power**: Photovoltaic panels and concentrated solar power systems
- **Wind Energy**: Onshore and offshore wind turbines
- **Hydroelectric**: River dams and small-scale hydro systems
- **Geothermal**: Underground heat for electricity and heating
- **Biomass**: Organic matter converted to energy

**Energy Efficiency:**
- Smart grids and energy storage systems
- LED lighting and efficient appliances
- Building insulation and green architecture
- Industrial process optimization

**Sustainable Transportation:**
- Electric vehicles (EVs) and charging infrastructure
- Public transportation expansion
- Active transport: walking and cycling infrastructure
- Sustainable aviation fuels and shipping technologies

**Carbon Capture and Nature-Based Solutions:**
- **Reforestation and Afforestation**: Planting trees to absorb CO2
- **Carbon Capture and Storage (CCS)**: Technology to capture CO2 from industrial sources
- **Regenerative Agriculture**: Farming practices that store carbon in soil
- **Wetland Restoration**: Natural carbon sinks and biodiversity protection

## Individual Climate Actions

**Energy and Home:**
- Switch to renewable energy providers
- Improve home insulation and use efficient appliances
- Install solar panels if feasible
- Use programmable thermostats

**Transportation:**
- Walk, bike, or use public transportation
- Consider electric or hybrid vehicles
- Reduce air travel and offset when necessary
- Work from home when possible

**Consumption and Diet:**
- Reduce meat consumption, especially beef
- Buy local and seasonal produce
- Minimize food waste
- Choose sustainable and durable products
- Practice the 3 R's: Reduce, Reuse, Recycle

**Civic Engagement:**
- Vote for leaders who prioritize climate action
- Support businesses with sustainable practices
- Educate others about climate change
- Participate in community environmental initiatives

## The Path Forward

Addressing climate change requires coordinated global action across all sectors of society. The Paris Agreement aims to limit global warming to well below 2°C, preferably 1.5°C, compared to pre-industrial levels. This requires rapid decarbonization, massive investment in clean energy, and fundamental changes in how we produce food, design cities, and power our economies.`,
          questions: [
            {
              id: 'q1',
              question: 'What is the enhanced greenhouse effect?',
              options: [
                'The natural process that keeps Earth warm',
                'Human activities intensifying the natural greenhouse effect, causing global warming',
                'A new type of renewable energy',
                'The cooling effect of greenhouse gases'
              ],
              correctAnswer: 1,
              explanation: 'The enhanced greenhouse effect refers to human activities dramatically increasing greenhouse gas concentrations, intensifying the natural greenhouse effect and causing global warming.'
            },
            {
              id: 'q2',
              question: 'Which individual action has the most significant impact on reducing carbon footprint?',
              options: [
                'Switching to LED light bulbs',
                'Reducing meat consumption, especially beef',
                'Recycling plastic bottles',
                'Taking shorter showers'
              ],
              correctAnswer: 1,
              explanation: 'Livestock farming, especially beef production, generates significant methane emissions and requires extensive land use, making dietary changes one of the most impactful individual climate actions.'
            }
          ],
          nextSteps: [
            'Calculate your carbon footprint',
            'Explore renewable energy options',
            'Learn about sustainable practices',
            'Join environmental advocacy groups'
          ],
          estimatedDuration: 20
        },
        '7': {
          content: `# Python Programming Basics

## What is Python?

Python is a high-level, interpreted programming language created by Guido van Rossum and first released in 1991. It's designed with an emphasis on code readability and simplicity, making it an excellent choice for beginners while being powerful enough for complex applications.

## Why Python is Popular

**Readable Syntax**: Python's syntax closely resembles English, making it intuitive to read and write.
**Versatile Applications**: Used in web development, data science, artificial intelligence, automation, scientific computing, and more.
**Large Community**: Extensive community support with millions of developers worldwide.
**Rich Ecosystem**: Thousands of libraries and frameworks available through PyPI (Python Package Index).
**Cross-Platform**: Runs on Windows, macOS, Linux, and other operating systems.

## Python Data Types

**Numbers**:
**Python Code Example:**
# Integers
age = 25
year = 2024

# Floats (decimal numbers)
price = 19.99
temperature = -5.7

# Complex numbers
complex_num = 3 + 4j

**Strings**:
**Python Code Example:**
# String creation
name = "Alice"
message = 'Hello, World!'
multiline = """This is a multiline string"""

# String methods
text = "python programming"
print(text.upper())        # PYTHON PROGRAMMING
print(text.capitalize())   # Python programming
print(text.replace("python", "Python"))  # Python programming

**Booleans**:
**Python Code Example:**
is_student = True
is_employed = False
has_license = True

# Boolean operations
print(is_student and has_license)  # True
print(is_student or is_employed)   # True
print(not is_employed)             # True

## Data Structures

**Lists** (ordered, mutable):
**Python Code Example:**
# Creating lists
fruits = ["apple", "banana", "orange"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]

# List operations
fruits.append("grape")      # Add to end
fruits.insert(0, "mango")   # Insert at index
fruits.remove("banana")     # Remove by value
print(len(fruits))          # Get length

**Dictionaries** (key-value pairs):
**Python Code Example:**
# Creating dictionaries
person = {
    "name": "John",
    "age": 30,
    "city": "New York",
    "skills": ["Python", "JavaScript"]
}

# Dictionary operations
print(person["name"])           # Access value
person["email"] = "john@email.com"  # Add new key-value
person.update({"age": 31})      # Update value
print(person.keys())            # Get all keys
print(person.values())          # Get all values

**Tuples** (ordered, immutable):
**Python Code Example:**
coordinates = (10, 20)
rgb_color = (255, 128, 0)
dimensions = (1920, 1080, 32)

# Tuple unpacking
x, y = coordinates
red, green, blue = rgb_color

## Control Flow

**Conditional Statements**:
**Python Code Example:**
age = 20
income = 50000

if age >= 18 and income > 30000:
    print("Eligible for loan")
elif age >= 18:
    print("Age requirement met, but income too low")
else:
    print("Not eligible")

# Ternary operator
status = "adult" if age >= 18 else "minor"

**Loops**:
**Python Code Example:**
# For loops
for i in range(5):          # 0, 1, 2, 3, 4
    print(f"Count: {i}")

for fruit in ["apple", "banana", "orange"]:
    print(f"I like {fruit}")

# While loops
count = 0
while count < 3:
    print(f"Count: {count}")
    count += 1

# List comprehension (advanced)
squares = [x**2 for x in range(10)]  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

## Functions

**Basic Functions**:
**Python Code Example:**
def greet(name):
    """Function to greet a person"""
    return f"Hello, {name}!"

def calculate_area(length, width=1):
    """Calculate area with optional width parameter"""
    return length * width

# Function calls
message = greet("Alice")
area1 = calculate_area(10, 5)    # 50
area2 = calculate_area(10)       # 10 (uses default width)

**Advanced Function Features**:
**Python Code Example:**
def process_data(*args, **kwargs):
    """Function with variable arguments"""
    print(f"Args: {args}")
    print(f"Kwargs: {kwargs}")

process_data(1, 2, 3, name="John", age=25)

# Lambda functions (anonymous functions)
square = lambda x: x**2
numbers = [1, 2, 3, 4, 5]
squared = list(map(square, numbers))  # [1, 4, 9, 16, 25]

## File Handling

**Python Code Example:**
# Writing to a file
with open("example.txt", "w") as file:
    file.write("Hello, Python!")

# Reading from a file
with open("example.txt", "r") as file:
    content = file.read()
    print(content)

# Reading line by line
with open("data.txt", "r") as file:
    for line in file:
        print(line.strip())

## Error Handling

**Python Code Example:**
try:
    number = int(input("Enter a number: "))
    result = 10 / number
    print(f"Result: {result}")
except ValueError:
    print("Invalid input! Please enter a number.")
except ZeroDivisionError:
    print("Cannot divide by zero!")
except Exception as e:
    print(f"An error occurred: {e}")
finally:
    print("This always executes")

## Popular Python Libraries

**Standard Library**:
- datetime: Working with dates and times
- json: JSON data handling
- random: Generate random numbers
- os: Operating system interface
- re: Regular expressions

**Third-Party Libraries**:
- requests: HTTP requests
- pandas: Data analysis and manipulation
- numpy: Numerical computing
- matplotlib: Data visualization
- flask/django: Web development
- tensorflow/pytorch: Machine learning

## Best Practices

1. **Follow PEP 8**: Python's style guide for clean, readable code
2. **Use meaningful variable names**: user_age instead of x
3. **Write docstrings**: Document your functions and classes
4. **Handle errors gracefully**: Use try-except blocks appropriately
5. **Keep functions small**: Each function should do one thing well
6. **Use virtual environments**: Isolate project dependencies

Python's philosophy emphasizes readability and simplicity, making it an excellent first programming language while being powerful enough for professional development.`,
          questions: [
            {
              id: 'q1',
              question: 'What is the main difference between lists and tuples in Python?',
              options: [
                'Lists are faster than tuples',
                'Lists are mutable (can be changed), tuples are immutable (cannot be changed)',
                'Tuples can only store numbers',
                'Lists and tuples are exactly the same'
              ],
              correctAnswer: 1,
              explanation: 'Lists are mutable, meaning you can modify them after creation (add, remove, change elements), while tuples are immutable and cannot be changed once created.'
            },
            {
              id: 'q2',
              question: 'What does this Python code do: squares = [x**2 for x in range(5)]?',
              options: [
                'Creates a function called squares',
                'Creates a list of squares: [0, 1, 4, 9, 16]',
                'Prints numbers from 0 to 5',
                'Creates an error'
              ],
              correctAnswer: 1,
              explanation: 'This is a list comprehension that creates a list containing the squares of numbers 0 through 4: [0, 1, 4, 9, 16]. It\'s a concise way to create lists in Python.'
            }
          ],
          nextSteps: [
            'Set up Python development environment',
            'Practice basic syntax with exercises',
            'Build simple programs',
            'Learn about Python libraries'
          ],
          estimatedDuration: 22
        },
        '3': {
          content: `# Data Structures and Algorithms

## What are Data Structures?

Data structures are ways of organizing and storing data in a computer so that it can be accessed and modified efficiently. They define the relationship between data elements and the operations that can be performed on them.

## Why Study Data Structures and Algorithms?

**Problem Solving**: Learn systematic approaches to breaking down complex problems.
**Efficiency**: Understand how to write code that runs faster and uses less memory.
**Technical Interviews**: Essential knowledge for software engineering positions.
**Foundation**: Building blocks for advanced computer science concepts.

## Common Data Structures

**Arrays**:
- **Definition**: Collection of elements stored in contiguous memory locations
- **Access Time**: O(1) - constant time access by index
- **Use Cases**: When you need fast access to elements by position
- **Example**: [1, 2, 3, 4, 5]

**Linked Lists**:
- **Definition**: Elements (nodes) connected through pointers/references
- **Types**: Singly linked, doubly linked, circular
- **Advantages**: Dynamic size, efficient insertion/deletion
- **Disadvantages**: No random access, extra memory for pointers

**Stacks (LIFO - Last In, First Out)**:
- **Operations**: Push (add), Pop (remove), Peek (view top)
- **Use Cases**: Function calls, undo operations, expression evaluation
- **Example**: Browser back button, undo functionality

**Queues (FIFO - First In, First Out)**:
- **Operations**: Enqueue (add to rear), Dequeue (remove from front)
- **Use Cases**: Task scheduling, breadth-first search, handling requests
- **Example**: Print queue, customer service lines

**Trees**:
- **Binary Trees**: Each node has at most two children (left and right)
- **Binary Search Trees (BST)**: Left child < parent < right child
- **Use Cases**: Hierarchical data, searching, sorting
- **Applications**: File systems, decision trees, databases

**Hash Tables (Hash Maps)**:
- **Definition**: Data structure that maps keys to values using hash functions
- **Average Time Complexity**: O(1) for search, insert, delete
- **Use Cases**: Caches, databases, associative arrays
- **Collision Handling**: Chaining, open addressing

**Graphs**:
- **Components**: Vertices (nodes) and edges (connections)
- **Types**: Directed vs undirected, weighted vs unweighted
- **Use Cases**: Social networks, maps, web crawling
- **Representation**: Adjacency matrix, adjacency list

## Essential Algorithms

**Sorting Algorithms**:
- **Bubble Sort**: O(n²) - Simple but inefficient for large datasets
- **Merge Sort**: O(n log n) - Divide and conquer, stable sorting
- **Quick Sort**: O(n log n) average - Fast in practice, in-place sorting
- **Heap Sort**: O(n log n) - Consistent performance, in-place

**Searching Algorithms**:
- **Linear Search**: O(n) - Check each element sequentially
- **Binary Search**: O(log n) - Efficient search in sorted arrays
- **Depth-First Search (DFS)**: Explore as far as possible before backtracking
- **Breadth-First Search (BFS)**: Explore all neighbors before moving deeper

**Dynamic Programming**:
- **Concept**: Break problems into subproblems, store results to avoid recalculation
- **Examples**: Fibonacci sequence, knapsack problem, longest common subsequence
- **Approach**: Identify overlapping subproblems and optimal substructure

## Big O Notation

**Time Complexity** - How runtime grows with input size:
- **O(1)**: Constant time - accessing array element
- **O(log n)**: Logarithmic time - binary search
- **O(n)**: Linear time - searching unsorted array
- **O(n log n)**: Linearithmic time - efficient sorting algorithms
- **O(n²)**: Quadratic time - nested loops, bubble sort
- **O(2^n)**: Exponential time - recursive Fibonacci (naive)

**Space Complexity** - How memory usage grows with input size:
- Consider both auxiliary space and input space
- Trade-offs between time and space efficiency

## Problem-Solving Strategies

**Understand the Problem**:
1. Read carefully and identify inputs/outputs
2. Work through examples manually
3. Identify constraints and edge cases

**Choose the Right Data Structure**:
- Need fast lookups? Consider hash tables
- Hierarchical data? Consider trees
- Sequential access? Consider arrays or linked lists
- LIFO operations? Consider stacks
- FIFO operations? Consider queues

**Algorithm Design Patterns**:
- **Brute Force**: Try all possible solutions
- **Divide and Conquer**: Break into smaller subproblems
- **Greedy**: Make locally optimal choices
- **Dynamic Programming**: Optimize overlapping subproblems
- **Backtracking**: Explore solutions and backtrack when needed

## Interview Preparation Tips

**Practice Categories**:
1. **Array and String Manipulation**: Two pointers, sliding window
2. **Linked List Operations**: Reversal, cycle detection
3. **Tree Traversals**: Inorder, preorder, postorder
4. **Graph Problems**: BFS, DFS, shortest path
5. **Dynamic Programming**: Memoization, tabulation

**Common Patterns**:
- Two pointers technique for arrays
- Fast and slow pointers for linked lists
- Level-order traversal for trees
- Topological sorting for directed graphs

Understanding data structures and algorithms provides the foundation for writing efficient, scalable software and excelling in technical interviews.`,
          questions: [
            {
              id: 'q1',
              question: 'What is the time complexity of accessing an element in an array by index?',
              options: [
                'O(n) - Linear time',
                'O(log n) - Logarithmic time',
                'O(1) - Constant time',
                'O(n²) - Quadratic time'
            ],
            correctAnswer: 2,
              explanation: 'Arrays provide O(1) constant time access to elements by index because elements are stored in contiguous memory locations, allowing direct calculation of memory address.'
          },
          {
              id: 'q2',
              question: 'Which data structure follows the LIFO (Last In, First Out) principle?',
            options: [
                'Queue',
                'Stack',
                'Array',
                'Hash Table'
            ],
            correctAnswer: 1,
              explanation: 'A stack follows the LIFO principle where the last element added is the first one to be removed, like a stack of plates where you add and remove from the top.'
          }
        ],
        nextSteps: [
            'Practice coding problems on platforms like LeetCode',
            'Implement data structures from scratch',
            'Study algorithm complexity analysis',
            'Prepare for technical interviews'
          ],
          estimatedDuration: 12
        },
        '4': {
          content: `# Digital Marketing Fundamentals

## What is Digital Marketing?

Digital marketing encompasses all marketing efforts that use electronic devices or the internet to connect with current and prospective customers. It leverages digital channels such as search engines, social media, email, websites, and mobile apps to reach consumers where they spend much of their time.

## Core Digital Marketing Channels

**Search Engine Optimization (SEO)**:
SEO is the practice of optimizing your website to rank higher in search engine results pages (SERPs) for relevant keywords.

**Key SEO Components:**
- **On-Page SEO**: Optimizing individual web pages (title tags, meta descriptions, headers, content quality, internal linking)
- **Off-Page SEO**: Building authority through backlinks, social signals, and brand mentions
- **Technical SEO**: Improving site speed, mobile responsiveness, crawlability, and site architecture
- **Keyword Research**: Identifying terms your target audience searches for using tools like Google Keyword Planner

**Search Engine Marketing (SEM)**:
Paid advertising on search engines, primarily through Google Ads and Bing Ads.
- **Pay-Per-Click (PPC)**: You pay only when someone clicks your ad
- **Ad Auction System**: Bids and Quality Score determine ad placement
- **Ad Extensions**: Additional information like phone numbers, site links, and locations

**Social Media Marketing**:
Leveraging social platforms to build brand awareness, engage audiences, and drive traffic.

**Major Platforms:**
- **Facebook**: Largest user base, excellent for B2C marketing, detailed targeting options
- **Instagram**: Visual content, younger demographics, Stories and Reels features
- **LinkedIn**: B2B networking, professional content, thought leadership
- **Twitter**: Real-time engagement, news, customer service, trending topics
- **TikTok**: Short-form videos, Gen Z audience, viral content potential
- **YouTube**: Video marketing, tutorials, product demonstrations, long-form content

**Content Marketing**:
Creating and distributing valuable, relevant content to attract and engage a target audience.

**Content Types:**
- **Blog Posts**: Educational articles, how-to guides, industry insights
- **Videos**: Product demos, tutorials, behind-the-scenes content
- **Infographics**: Visual data representation, easy-to-share content
- **Podcasts**: Audio content, interviews, industry discussions
- **Ebooks and Whitepapers**: In-depth resources for lead generation

**Email Marketing**:
Direct communication with subscribers through targeted email campaigns.

**Email Campaign Types:**
- **Welcome Series**: Onboard new subscribers
- **Newsletter**: Regular updates and valuable content
- **Promotional**: Product launches, sales, special offers
- **Behavioral Triggers**: Abandoned cart, birthday emails, re-engagement
- **Drip Campaigns**: Automated sequences based on user actions

## Digital Marketing Analytics

**Google Analytics**:
Free web analytics tool that tracks website traffic and user behavior.

**Key Metrics:**
- **Traffic Sources**: Organic search, paid ads, social media, direct visits
- **User Behavior**: Pages per session, bounce rate, session duration
- **Conversions**: Goal completions, e-commerce transactions, lead generation
- **Demographics**: Age, gender, location, interests of your audience

**Key Performance Indicators (KPIs)**:
- **Awareness Metrics**: Reach, impressions, brand mentions, share of voice
- **Engagement Metrics**: Click-through rate (CTR), social media engagement, time on page
- **Conversion Metrics**: Conversion rate, cost per acquisition (CPA), return on ad spend (ROAS)
- **Retention Metrics**: Customer lifetime value (CLV), repeat purchase rate, churn rate

## Digital Marketing Strategy Development

**Target Audience Definition**:
Creating detailed buyer personas based on demographics, psychographics, and behavior patterns.

**Customer Journey Mapping**:
- **Awareness Stage**: Problem recognition, information seeking
- **Consideration Stage**: Evaluating solutions, comparing options
- **Decision Stage**: Making purchase decisions, post-purchase experience
- **Retention Stage**: Building loyalty, encouraging repeat purchases

**Marketing Funnel Optimization**:
- **Top of Funnel (TOFU)**: Brand awareness, content marketing, SEO
- **Middle of Funnel (MOFU)**: Lead nurturing, email marketing, retargeting
- **Bottom of Funnel (BOFU)**: Conversion optimization, sales enablement

## Emerging Digital Marketing Trends

**Artificial Intelligence and Machine Learning**:
- **Chatbots**: Automated customer service and lead qualification
- **Predictive Analytics**: Forecasting customer behavior and preferences
- **Personalization**: Dynamic content based on user data and behavior
- **Programmatic Advertising**: Automated ad buying using AI algorithms

**Voice Search Optimization**:
- **Conversational Keywords**: Optimizing for natural language queries
- **Featured Snippets**: Targeting position zero in search results
- **Local SEO**: Voice searches often have local intent

**Video Marketing Evolution**:
- **Live Streaming**: Real-time engagement on social platforms
- **Interactive Videos**: Clickable elements, choose-your-own-adventure content
- **Short-Form Content**: TikTok-style videos across all platforms

## Digital Marketing Tools and Platforms

**SEO Tools**:
- **Google Search Console**: Monitor search performance and technical issues
- **SEMrush/Ahrefs**: Keyword research, competitor analysis, backlink tracking
- **Screaming Frog**: Technical SEO audits and site crawling

**Social Media Management**:
- **Hootsuite/Buffer**: Schedule posts across multiple platforms
- **Sprout Social**: Social listening and engagement management
- **Canva**: Create visual content and graphics

**Email Marketing Platforms**:
- **Mailchimp**: User-friendly interface, automation features
- **ConvertKit**: Creator-focused, advanced segmentation
- **HubSpot**: All-in-one marketing automation and CRM

**Analytics and Reporting**:
- **Google Analytics**: Website traffic and user behavior analysis
- **Google Tag Manager**: Implement tracking codes without coding
- **Data Studio**: Create custom dashboards and reports

## Measuring Digital Marketing ROI

**Return on Investment Calculation**:
ROI = (Revenue Generated - Marketing Investment) / Marketing Investment × 100

**Attribution Models**:
- **First-Touch**: Credit to the first interaction
- **Last-Touch**: Credit to the final interaction before conversion
- **Multi-Touch**: Distribute credit across multiple touchpoints
- **Time-Decay**: More credit to recent interactions

**A/B Testing**:
Systematically testing different versions of marketing elements to optimize performance.
- **Email Subject Lines**: Test different approaches to improve open rates
- **Landing Pages**: Compare layouts, headlines, and call-to-action buttons
- **Ad Creative**: Test different images, copy, and targeting options

Digital marketing success requires continuous learning, testing, and adaptation to changing consumer behaviors and platform algorithms.`,
          questions: [
            {
              id: 'q1',
              question: 'What is the main difference between SEO and SEM?',
              options: [
                'SEO is for social media, SEM is for search engines',
                'SEO focuses on organic search results, SEM involves paid search advertising',
                'SEO is free, SEM costs money',
                'There is no difference between SEO and SEM'
              ],
              correctAnswer: 1,
              explanation: 'SEO (Search Engine Optimization) focuses on improving organic search rankings through content and technical optimization, while SEM (Search Engine Marketing) involves paid advertising on search engines like Google Ads.'
            },
            {
              id: 'q2',
              question: 'Which metric is most important for measuring email marketing success?',
              options: [
                'Number of emails sent',
                'Open rate and click-through rate',
                'Size of email list',
                'Frequency of sending emails'
              ],
              correctAnswer: 1,
              explanation: 'Open rate and click-through rate are key metrics because they measure actual engagement - how many people opened your email and took action, which directly correlates with campaign effectiveness and ROI.'
            }
          ],
          nextSteps: [
            'Set up Google Analytics for your website',
            'Create social media business accounts',
            'Learn Google Ads fundamentals',
            'Develop a content marketing strategy'
          ],
          estimatedDuration: 18
        },
        '5': {
          content: `# Cybersecurity Essentials

## What is Cybersecurity?

Cybersecurity is the practice of protecting systems, networks, programs, and data from digital attacks, unauthorized access, and damage. It encompasses technologies, processes, and practices designed to safeguard digital information and maintain the confidentiality, integrity, and availability of data.

## The CIA Triad - Core Security Principles

**Confidentiality**:
Ensuring that sensitive information is accessible only to authorized individuals.
- **Data Encryption**: Converting data into unreadable format for unauthorized users
- **Access Controls**: User authentication and authorization systems
- **Privacy Protection**: Safeguarding personal and sensitive information

**Integrity**:
Maintaining the accuracy and completeness of data and systems.
- **Data Validation**: Ensuring data hasn't been tampered with or corrupted
- **Digital Signatures**: Verifying the authenticity of digital documents
- **Version Control**: Tracking changes and maintaining data consistency

**Availability**:
Ensuring that authorized users have reliable access to information and resources.
- **System Redundancy**: Backup systems to prevent single points of failure
- **Disaster Recovery**: Plans to restore operations after incidents
- **Load Balancing**: Distributing workload to prevent system overload

## Common Cyber Threats

**Malware (Malicious Software)**:
- **Viruses**: Self-replicating programs that attach to other files
- **Worms**: Standalone malware that spreads across networks
- **Trojans**: Disguised malware that appears legitimate
- **Ransomware**: Encrypts data and demands payment for decryption
- **Spyware**: Secretly monitors and collects user information
- **Rootkits**: Hidden malware that maintains persistent access

**Social Engineering Attacks**:
Manipulating people to divulge confidential information or perform actions.
- **Phishing**: Fraudulent emails requesting sensitive information
- **Spear Phishing**: Targeted phishing attacks on specific individuals
- **Vishing**: Voice-based phishing through phone calls
- **Smishing**: SMS-based phishing attacks
- **Pretexting**: Creating false scenarios to gain trust and information

**Network Attacks**:
- **Man-in-the-Middle (MitM)**: Intercepting communications between parties
- **Denial of Service (DoS)**: Overwhelming systems to make them unavailable
- **Distributed DoS (DDoS)**: Using multiple systems to launch DoS attacks
- **SQL Injection**: Exploiting database vulnerabilities through malicious queries
- **Cross-Site Scripting (XSS)**: Injecting malicious scripts into web applications

## Authentication and Access Control

**Multi-Factor Authentication (MFA)**:
Using multiple verification methods to confirm user identity.
- **Something You Know**: Passwords, PINs, security questions
- **Something You Have**: Smart cards, tokens, mobile devices
- **Something You Are**: Biometrics (fingerprints, facial recognition, iris scans)

**Password Security Best Practices**:
- **Complexity Requirements**: Mix of uppercase, lowercase, numbers, and symbols
- **Length**: Minimum 12-16 characters for strong passwords
- **Uniqueness**: Different passwords for each account
- **Password Managers**: Tools to generate and store strong passwords securely
- **Regular Updates**: Changing passwords periodically, especially after breaches

**Access Control Models**:
- **Role-Based Access Control (RBAC)**: Permissions based on user roles
- **Attribute-Based Access Control (ABAC)**: Dynamic permissions based on attributes
- **Principle of Least Privilege**: Users get minimum access necessary for their role
- **Zero Trust Model**: "Never trust, always verify" approach to security

## Network Security

**Firewalls**:
Network security devices that monitor and control traffic based on security rules.
- **Packet Filtering**: Examining individual data packets
- **Stateful Inspection**: Tracking connection states and context
- **Application Layer**: Deep packet inspection of application data
- **Next-Generation Firewalls**: Advanced threat detection and prevention

**Virtual Private Networks (VPNs)**:
Secure connections over public networks using encryption.
- **Site-to-Site VPNs**: Connecting multiple office locations
- **Remote Access VPNs**: Secure access for remote workers
- **Encryption Protocols**: IPSec, OpenVPN, WireGuard
- **VPN Benefits**: Privacy protection, geo-restriction bypass, secure public Wi-Fi usage

**Intrusion Detection and Prevention**:
- **Intrusion Detection Systems (IDS)**: Monitor and alert on suspicious activities
- **Intrusion Prevention Systems (IPS)**: Automatically block detected threats
- **Security Information and Event Management (SIEM)**: Centralized security monitoring
- **Network Segmentation**: Isolating network sections to contain breaches

## Data Protection and Encryption

**Encryption Methods**:
- **Symmetric Encryption**: Same key for encryption and decryption (AES)
- **Asymmetric Encryption**: Public-private key pairs (RSA, ECC)
- **Hash Functions**: One-way data transformation for integrity verification
- **Digital Certificates**: Verify identity and enable secure communications

**Data Loss Prevention (DLP)**:
- **Data Classification**: Categorizing information by sensitivity level
- **Content Monitoring**: Scanning data in motion, at rest, and in use
- **Policy Enforcement**: Preventing unauthorized data transmission
- **Endpoint Protection**: Securing data on user devices

**Backup and Recovery**:
- **3-2-1 Rule**: 3 copies of data, 2 different media types, 1 offsite backup
- **Regular Testing**: Verifying backup integrity and recovery procedures
- **Recovery Time Objective (RTO)**: Target time to restore operations
- **Recovery Point Objective (RPO)**: Maximum acceptable data loss

## Incident Response and Management

**Incident Response Phases**:
1. **Preparation**: Developing plans, training teams, establishing procedures
2. **Identification**: Detecting and analyzing security events
3. **Containment**: Limiting damage and preventing spread
4. **Eradication**: Removing threats and vulnerabilities
5. **Recovery**: Restoring systems and returning to normal operations
6. **Lessons Learned**: Analyzing incidents to improve future response

**Digital Forensics**:
- **Evidence Collection**: Preserving digital evidence for investigation
- **Chain of Custody**: Maintaining evidence integrity and documentation
- **Analysis Tools**: Software for examining digital artifacts
- **Legal Considerations**: Ensuring admissibility in legal proceedings

## Compliance and Regulations

**Major Cybersecurity Frameworks**:
- **NIST Cybersecurity Framework**: Identify, Protect, Detect, Respond, Recover
- **ISO 27001**: International standard for information security management
- **CIS Controls**: Prioritized security actions for cyber defense
- **COBIT**: Governance framework for IT and cybersecurity

**Regulatory Requirements**:
- **GDPR**: European data protection regulation
- **HIPAA**: Healthcare information privacy in the US
- **PCI DSS**: Payment card industry data security standards
- **SOX**: Financial reporting and data integrity requirements

## Emerging Cybersecurity Challenges

**Cloud Security**:
- **Shared Responsibility Model**: Understanding provider vs. customer responsibilities
- **Identity and Access Management (IAM)**: Controlling cloud resource access
- **Data Sovereignty**: Knowing where data is stored and processed
- **Multi-Cloud Security**: Managing security across different cloud providers

**IoT Security**:
- **Device Authentication**: Ensuring only authorized devices connect
- **Firmware Updates**: Keeping IoT devices patched and secure
- **Network Isolation**: Separating IoT devices from critical systems
- **Default Credentials**: Changing default passwords on IoT devices

**AI and Machine Learning in Security**:
- **Threat Detection**: Using AI to identify anomalous behavior
- **Automated Response**: AI-driven incident response systems
- **Adversarial AI**: Protecting against AI-powered attacks
- **Bias and Fairness**: Ensuring AI security systems don't discriminate

Cybersecurity is an ongoing process requiring constant vigilance, regular updates, and continuous learning to stay ahead of evolving threats.`,
          questions: [
            {
              id: 'q1',
              question: 'What does the CIA triad in cybersecurity stand for?',
              options: [
                'Central Intelligence Agency principles',
                'Confidentiality, Integrity, and Availability',
                'Computer, Internet, and Application security',
                'Cyber, Information, and Access protection'
              ],
              correctAnswer: 1,
              explanation: 'The CIA triad represents the three core principles of cybersecurity: Confidentiality (protecting sensitive information), Integrity (maintaining data accuracy), and Availability (ensuring authorized access to resources).'
            },
            {
              id: 'q2',
              question: 'What is the main purpose of Multi-Factor Authentication (MFA)?',
              options: [
                'To make login faster',
                'To reduce password complexity requirements',
                'To add multiple layers of security verification',
                'To eliminate the need for passwords'
              ],
              correctAnswer: 2,
              explanation: 'MFA adds multiple layers of security by requiring users to provide two or more verification factors (something you know, have, or are), making it much harder for attackers to gain unauthorized access even if they compromise one factor.'
            }
          ],
          nextSteps: [
            'Set up MFA on all important accounts',
            'Learn about common phishing techniques',
            'Practice secure password management',
            'Study network security fundamentals'
          ],
          estimatedDuration: 14
        },
        '6': {
          content: `# Financial Literacy & Investment

## Understanding Personal Finance

Financial literacy is the ability to understand and effectively use various financial skills, including personal financial management, budgeting, and investing. It provides the foundation for making informed financial decisions that can lead to long-term financial security and wealth building.

## Budgeting and Money Management

**The 50/30/20 Rule**:
A simple budgeting framework for allocating after-tax income.
- **50% Needs**: Essential expenses (housing, utilities, groceries, minimum debt payments)
- **30% Wants**: Discretionary spending (entertainment, dining out, hobbies)
- **20% Savings and Debt Repayment**: Emergency fund, retirement, extra debt payments

**Emergency Fund**:
A financial safety net for unexpected expenses.
- **Target Amount**: 3-6 months of living expenses
- **Accessibility**: Keep in high-yield savings account for easy access
- **Priority**: Build emergency fund before investing in other areas
- **Uses**: Job loss, medical emergencies, major home repairs

**Debt Management Strategies**:
- **Debt Snowball**: Pay minimum on all debts, focus extra payments on smallest balance
- **Debt Avalanche**: Pay minimum on all debts, focus extra payments on highest interest rate
- **Debt Consolidation**: Combine multiple debts into single payment with lower interest
- **Balance Transfers**: Move high-interest debt to lower-interest credit card

## Understanding Credit

**Credit Score Factors**:
- **Payment History (35%)**: On-time payments are most important factor
- **Credit Utilization (30%)**: Keep credit card balances below 30% of limits
- **Length of Credit History (15%)**: Longer history generally better
- **Credit Mix (10%)**: Variety of credit types (cards, loans, mortgages)
- **New Credit (10%)**: Limit new credit applications and hard inquiries

**Building Good Credit**:
- **Pay Bills on Time**: Set up automatic payments for at least minimums
- **Keep Old Accounts Open**: Maintains longer credit history
- **Monitor Credit Reports**: Check annually for errors and fraud
- **Use Credit Responsibly**: Don't max out credit cards or apply for unnecessary credit

## Investment Fundamentals

**Risk vs. Return**:
Higher potential returns typically come with higher risk.
- **Conservative Investments**: Savings accounts, CDs, government bonds (low risk, low return)
- **Moderate Investments**: Corporate bonds, balanced mutual funds (medium risk, medium return)
- **Aggressive Investments**: Individual stocks, growth funds, real estate (high risk, high return)

**Time Horizon and Compounding**:
- **Compound Interest**: Earning returns on both principal and previously earned returns
- **Rule of 72**: Divide 72 by interest rate to estimate years to double investment
- **Dollar-Cost Averaging**: Investing fixed amounts regularly regardless of market conditions
- **Time in Market**: Long-term investing typically outperforms market timing attempts

## Types of Investment Accounts

**Tax-Advantaged Retirement Accounts**:
- **401(k)**: Employer-sponsored retirement plan, often with company matching
- **Traditional IRA**: Tax-deductible contributions, taxed on withdrawal
- **Roth IRA**: After-tax contributions, tax-free growth and withdrawals in retirement
- **SEP-IRA**: For self-employed individuals and small business owners

**Taxable Investment Accounts**:
- **Brokerage Accounts**: No contribution limits, more flexibility, taxed on gains
- **High-Yield Savings**: FDIC insured, liquid, low returns
- **Certificates of Deposit (CDs)**: Fixed returns, penalties for early withdrawal

## Investment Vehicles

**Stocks (Equities)**:
Ownership shares in public companies.
- **Growth Stocks**: Companies expected to grow faster than market average
- **Value Stocks**: Companies trading below their intrinsic value
- **Dividend Stocks**: Companies that pay regular dividends to shareholders
- **Market Capitalization**: Large-cap (stable), mid-cap (moderate growth), small-cap (high growth potential)

**Bonds (Fixed Income)**:
Loans to governments or corporations that pay interest.
- **Government Bonds**: US Treasury bonds, considered very safe
- **Corporate Bonds**: Higher yields but more risk than government bonds
- **Municipal Bonds**: Issued by state/local governments, often tax-free
- **Bond Duration**: Longer duration bonds more sensitive to interest rate changes

**Mutual Funds and ETFs**:
- **Mutual Funds**: Pooled investments managed by professionals, priced once daily
- **Exchange-Traded Funds (ETFs)**: Trade like stocks, typically lower fees than mutual funds
- **Index Funds**: Track market indices, low fees, passive management
- **Actively Managed Funds**: Professional managers try to beat market, higher fees

## Portfolio Diversification

**Asset Allocation**:
Spreading investments across different asset classes.
- **Age-Based Rule**: Stock percentage = 100 minus your age (e.g., 30-year-old: 70% stocks, 30% bonds)
- **Risk Tolerance**: Conservative, moderate, or aggressive allocation based on comfort with volatility
- **Rebalancing**: Periodically adjusting portfolio back to target allocation

**Geographic Diversification**:
- **Domestic Investments**: US stocks and bonds
- **International Developed Markets**: Europe, Japan, Australia
- **Emerging Markets**: Higher growth potential but more volatile
- **Global Funds**: Provide automatic international diversification

## Retirement Planning

**Retirement Savings Targets**:
- **General Rule**: Save 10-15% of income for retirement
- **Replacement Ratio**: Aim to replace 70-90% of pre-retirement income
- **Catch-Up Contributions**: Additional contributions allowed after age 50

**Social Security**:
- **Full Retirement Age**: 66-67 depending on birth year
- **Early vs. Delayed Benefits**: Can claim as early as 62 (reduced) or delay until 70 (increased)
- **Benefit Calculation**: Based on highest 35 years of earnings
- **Spousal Benefits**: May be eligible for benefits based on spouse's earnings record

## Tax-Efficient Investing

**Tax-Loss Harvesting**:
Selling losing investments to offset gains and reduce taxes.
- **Wash Sale Rule**: Can't repurchase same security within 30 days
- **Long-Term vs. Short-Term**: Hold investments over one year for lower tax rates
- **Tax-Efficient Funds**: Index funds and tax-managed funds minimize taxable distributions

**Asset Location**:
Placing investments in appropriate account types for tax efficiency.
- **Tax-Deferred Accounts**: High-growth investments, bonds
- **Roth Accounts**: High-growth investments expected to appreciate significantly
- **Taxable Accounts**: Tax-efficient investments, investments you may need to access

## Common Investment Mistakes

**Emotional Investing**:
- **Fear and Greed**: Buying high during euphoria, selling low during panic
- **Overconfidence**: Taking excessive risks after successful investments
- **Analysis Paralysis**: Waiting for perfect investment opportunity instead of starting

**Poor Diversification**:
- **Concentration Risk**: Too much in single stock or sector
- **Home Country Bias**: Overweighting domestic investments
- **Employer Stock**: Too much retirement savings in company stock

**Timing and Fees**:
- **Market Timing**: Trying to predict market movements
- **High Fees**: Expensive actively managed funds that don't outperform
- **Frequent Trading**: Transaction costs and taxes erode returns

## Building Wealth Strategies

**The Millionaire Formula**:
Consistent saving and investing over time with compound growth.
- **Start Early**: Time is most powerful wealth-building tool
- **Live Below Means**: Spend less than you earn consistently
- **Increase Savings Rate**: Boost savings with raises and bonuses
- **Invest Regularly**: Automate investments to remove emotions

**Multiple Income Streams**:
- **Career Advancement**: Develop skills to increase earning potential
- **Side Hustles**: Freelancing, consulting, online businesses
- **Passive Income**: Dividends, rental properties, royalties
- **Investment Growth**: Long-term appreciation of invested assets

**Estate Planning Basics**:
- **Will**: Legal document specifying asset distribution
- **Beneficiaries**: Keep retirement and insurance beneficiaries updated
- **Power of Attorney**: Designate someone to make financial decisions if incapacitated
- **Life Insurance**: Protect dependents from financial hardship

Financial success requires discipline, patience, and continuous learning. Start with solid fundamentals and gradually build more sophisticated strategies as your knowledge and wealth grow.`,
          questions: [
            {
              id: 'q1',
              question: 'What is the 50/30/20 budgeting rule?',
              options: [
                '50% savings, 30% needs, 20% wants',
                '50% needs, 30% wants, 20% savings and debt repayment',
                '50% wants, 30% needs, 20% investments',
                '50% income, 30% expenses, 20% taxes'
              ],
              correctAnswer: 1,
              explanation: 'The 50/30/20 rule allocates after-tax income as follows: 50% for needs (essential expenses), 30% for wants (discretionary spending), and 20% for savings and debt repayment.'
            },
            {
              id: 'q2',
              question: 'What is the primary benefit of compound interest in investing?',
              options: [
                'It guarantees no losses',
                'It provides tax benefits',
                'You earn returns on both your principal and previously earned returns',
                'It eliminates investment risk'
              ],
              correctAnswer: 2,
              explanation: 'Compound interest allows you to earn returns not just on your original investment (principal), but also on all the returns you\'ve previously earned, creating exponential growth over time.'
            }
          ],
          nextSteps: [
            'Create a personal budget using the 50/30/20 rule',
            'Build an emergency fund',
            'Open a retirement account (401k or IRA)',
            'Learn about different investment options'
          ],
          estimatedDuration: 25
        },
        '8': {
          content: `# Web Development Fundamentals

## What is Web Development?

Web development is the process of building and maintaining websites and web applications. It encompasses everything from creating simple static pages to complex interactive applications that run in web browsers. Modern web development involves front-end (client-side), back-end (server-side), and full-stack development.

## HTML5 - Structure and Content

**HTML Basics**:
HTML (HyperText Markup Language) provides the structure and content of web pages using elements and tags.

**Essential HTML Elements**:
- **Document Structure**: html, head, body, title, meta
- **Text Content**: h1-h6, p, span, div, strong, em
- **Lists**: ul, ol, li for unordered and ordered lists
- **Links and Navigation**: a tags with href attributes
- **Images and Media**: img, video, audio elements
- **Forms**: form, input, textarea, select, button
- **Semantic Elements**: header, nav, main, section, article, aside, footer

**HTML5 Features**:
- **Semantic Elements**: Better structure and accessibility
- **Form Enhancements**: New input types (email, date, number, range)
- **Multimedia Support**: Native video and audio elements
- **Canvas and SVG**: Graphics and animations
- **Local Storage**: Client-side data storage
- **Geolocation API**: Access to user location

## CSS3 - Styling and Layout

**CSS Fundamentals**:
CSS (Cascading Style Sheets) controls the presentation, layout, and visual appearance of HTML elements.

**CSS Selectors**:
- **Element Selectors**: p, h1, div
- **Class Selectors**: .classname
- **ID Selectors**: #idname
- **Attribute Selectors**: [type="text"]
- **Pseudo-classes**: :hover, :focus, :nth-child()
- **Pseudo-elements**: ::before, ::after

**Box Model**:
Understanding how elements are sized and spaced.
- **Content**: The actual content area
- **Padding**: Space between content and border
- **Border**: Line around the padding and content
- **Margin**: Space outside the border

**Modern Layout Techniques**:
- **Flexbox**: One-dimensional layout for rows or columns
  - **Container Properties**: display: flex, justify-content, align-items
  - **Item Properties**: flex-grow, flex-shrink, flex-basis
- **CSS Grid**: Two-dimensional layout system
  - **Grid Container**: display: grid, grid-template-columns, grid-template-rows
  - **Grid Items**: grid-column, grid-row, grid-area

**Responsive Design**:
- **Media Queries**: Different styles for different screen sizes
- **Flexible Units**: em, rem, %, vw, vh instead of fixed pixels
- **Mobile-First Approach**: Design for mobile, then enhance for desktop
- **Viewport Meta Tag**: Proper scaling on mobile devices

## JavaScript - Interactivity and Logic

**JavaScript Basics**:
JavaScript adds interactivity and dynamic behavior to web pages.

**Variables and Data Types**:
- **Variable Declarations**: var, let, const
- **Primitive Types**: string, number, boolean, null, undefined, symbol
- **Reference Types**: objects, arrays, functions
- **Template Literals**: String interpolation with backticks

**Functions and Scope**:
- **Function Declarations**: function name() {}
- **Function Expressions**: const func = function() {}
- **Arrow Functions**: const func = () => {}
- **Scope**: Global, function, and block scope
- **Closures**: Functions accessing outer scope variables

**DOM Manipulation**:
- **Selecting Elements**: getElementById, querySelector, querySelectorAll
- **Modifying Content**: innerHTML, textContent, setAttribute
- **Event Handling**: addEventListener, onClick, onSubmit
- **Creating Elements**: createElement, appendChild, removeChild

**Asynchronous JavaScript**:
- **Callbacks**: Functions passed as arguments to other functions
- **Promises**: Handling asynchronous operations with .then() and .catch()
- **Async/Await**: Modern syntax for handling promises
- **Fetch API**: Making HTTP requests to servers

## Modern Web Development Tools

**Version Control**:
- **Git**: Distributed version control system
- **GitHub/GitLab**: Cloud-based Git repositories
- **Basic Commands**: git add, git commit, git push, git pull
- **Branching**: Creating and merging branches for features

**Package Managers**:
- **npm**: Node Package Manager for JavaScript libraries
- **Yarn**: Alternative package manager with improved performance
- **Package.json**: Configuration file for project dependencies
- **Semantic Versioning**: Understanding version numbers (major.minor.patch)

**Build Tools and Bundlers**:
- **Webpack**: Module bundler for JavaScript applications
- **Vite**: Fast build tool for modern web development
- **Parcel**: Zero-configuration build tool
- **Babel**: JavaScript compiler for older browser compatibility

## Front-End Frameworks and Libraries

**React Fundamentals**:
- **Components**: Reusable UI building blocks
- **JSX**: JavaScript syntax extension for writing HTML-like code
- **Props**: Passing data between components
- **State**: Managing component data and re-rendering
- **Event Handling**: onClick, onChange, onSubmit

**Vue.js Basics**:
- **Template Syntax**: Declarative rendering with directives
- **Data Binding**: Two-way data binding with v-model
- **Components**: Single File Components (.vue files)
- **Reactivity**: Automatic UI updates when data changes

**Angular Overview**:
- **TypeScript**: Strongly-typed JavaScript superset
- **Components and Services**: Separation of concerns
- **Dependency Injection**: Managing component dependencies
- **Routing**: Single Page Application navigation

## Web Performance Optimization

**Loading Performance**:
- **Minimize HTTP Requests**: Combine CSS/JS files, use sprites
- **Optimize Images**: Proper formats (WebP, AVIF), compression, lazy loading
- **Code Splitting**: Load only necessary code for each page
- **Caching**: Browser caching, CDNs, service workers

**Runtime Performance**:
- **Efficient DOM Manipulation**: Minimize reflows and repaints
- **Event Delegation**: Attach events to parent elements
- **Debouncing and Throttling**: Limit function execution frequency
- **Memory Management**: Avoid memory leaks, clean up event listeners

## Web Accessibility (a11y)

**Accessibility Principles**:
- **Perceivable**: Information presentable in ways users can perceive
- **Operable**: Interface components must be operable
- **Understandable**: Information and UI operation must be understandable
- **Robust**: Content must be robust enough for various assistive technologies

**Implementation Techniques**:
- **Semantic HTML**: Use appropriate elements for content meaning
- **Alt Text**: Descriptive text for images and media
- **Keyboard Navigation**: Ensure all functionality is keyboard accessible
- **Color Contrast**: Sufficient contrast ratios for text readability
- **Screen Reader Support**: ARIA labels and roles

## Web Security Basics

**Common Vulnerabilities**:
- **Cross-Site Scripting (XSS)**: Malicious script injection
- **Cross-Site Request Forgery (CSRF)**: Unauthorized commands from trusted users
- **SQL Injection**: Malicious database queries
- **Man-in-the-Middle**: Intercepted communications

**Security Best Practices**:
- **Input Validation**: Sanitize and validate user input
- **HTTPS**: Encrypt data in transit with SSL/TLS
- **Content Security Policy**: Prevent XSS attacks
- **Authentication**: Secure user login systems
- **Regular Updates**: Keep dependencies and frameworks updated

## Testing and Debugging

**Testing Types**:
- **Unit Tests**: Testing individual functions or components
- **Integration Tests**: Testing component interactions
- **End-to-End Tests**: Testing complete user workflows
- **Cross-Browser Testing**: Ensuring compatibility across browsers

**Debugging Tools**:
- **Browser DevTools**: Console, Network, Elements, Sources panels
- **Breakpoints**: Pausing code execution for inspection
- **Console Logging**: Outputting values and debugging information
- **Performance Profiling**: Identifying bottlenecks and optimization opportunities

Modern web development requires understanding of multiple technologies and continuous learning to keep up with evolving standards and best practices.`,
          questions: [
            {
              id: 'q1',
              question: 'What is the difference between HTML, CSS, and JavaScript in web development?',
              options: [
                'They all do the same thing',
                'HTML provides structure, CSS handles styling, JavaScript adds interactivity',
                'HTML is for mobile, CSS for desktop, JavaScript for servers',
                'They are different versions of the same language'
              ],
              correctAnswer: 1,
              explanation: 'HTML provides the structure and content of web pages, CSS controls the visual styling and layout, and JavaScript adds interactive behavior and dynamic functionality.'
            },
            {
              id: 'q2',
              question: 'What is the CSS Box Model?',
              options: [
                'A method for creating boxes on web pages',
                'The structure of content, padding, border, and margin around elements',
                'A CSS framework for layouts',
                'A tool for debugging CSS'
              ],
              correctAnswer: 1,
              explanation: 'The CSS Box Model describes how elements are structured with content at the center, surrounded by padding, border, and margin layers, which determines spacing and sizing.'
            }
          ],
          nextSteps: [
            'Build a simple HTML page with semantic elements',
            'Practice CSS layouts with Flexbox and Grid',
            'Learn JavaScript DOM manipulation',
            'Create a responsive website project'
          ],
          estimatedDuration: 30
        },
        '12': {
          content: `# Project Management Essentials

## What is Project Management?

Project management is the application of knowledge, skills, tools, and techniques to project activities to meet project requirements. It involves planning, executing, and closing projects while managing resources, timelines, budgets, and stakeholder expectations to achieve specific goals.

## Core Project Management Concepts

**Project vs. Operations**:
- **Projects**: Temporary endeavors with defined start and end dates, unique deliverables
- **Operations**: Ongoing, repetitive activities that sustain the organization
- **Project Characteristics**: Temporary, unique, progressive elaboration, resource constraints

**Project Life Cycle**:
1. **Initiation**: Define project scope, objectives, and stakeholders
2. **Planning**: Develop detailed project plans, schedules, and resource allocation
3. **Execution**: Implement project plans and coordinate people and resources
4. **Monitoring & Controlling**: Track progress and manage changes
5. **Closing**: Finalize activities, document lessons learned, release resources

## Agile Methodology

**Agile Principles**:
Agile emphasizes iterative development, collaboration, and adaptability to change.

**Core Values**:
- **Individuals and interactions** over processes and tools
- **Working software** over comprehensive documentation
- **Customer collaboration** over contract negotiation
- **Responding to change** over following a plan

**Agile Framework Benefits**:
- **Faster Time to Market**: Deliver working products quickly
- **Higher Quality**: Continuous testing and feedback
- **Better Risk Management**: Early detection of issues
- **Increased Flexibility**: Adapt to changing requirements
- **Improved Team Morale**: Self-organizing teams and regular retrospectives

## Scrum Framework

**Scrum Roles**:
- **Product Owner**: Defines product vision, manages backlog, prioritizes features
- **Scrum Master**: Facilitates process, removes impediments, coaches team
- **Development Team**: Cross-functional team that builds the product

**Scrum Events (Ceremonies)**:
- **Sprint Planning**: Plan work for upcoming sprint (2-4 weeks)
- **Daily Scrum**: 15-minute daily synchronization meeting
- **Sprint Review**: Demonstrate completed work to stakeholders
- **Sprint Retrospective**: Team reflects on process and identifies improvements

**Scrum Artifacts**:
- **Product Backlog**: Prioritized list of features and requirements
- **Sprint Backlog**: Work selected for current sprint
- **Product Increment**: Potentially shippable product functionality

## Kanban Method

**Kanban Principles**:
Visual workflow management system focusing on continuous delivery.

**Key Elements**:
- **Kanban Board**: Visual representation of work stages (To Do, In Progress, Done)
- **Work in Progress (WIP) Limits**: Limit concurrent work to improve flow
- **Continuous Flow**: Work moves through system smoothly
- **Pull System**: New work pulled when capacity available

**Kanban Benefits**:
- **Visual Management**: Clear view of work status
- **Flexibility**: No fixed iterations, continuous planning
- **Efficiency**: Identify and eliminate bottlenecks
- **Predictability**: Better forecasting based on historical data

## Traditional Project Management (Waterfall)

**Waterfall Phases**:
Sequential approach where each phase must complete before next begins.
1. **Requirements**: Gather and document all requirements
2. **Design**: Create system architecture and detailed design
3. **Implementation**: Build the system according to design
4. **Testing**: Verify system meets requirements
5. **Deployment**: Release system to users
6. **Maintenance**: Ongoing support and bug fixes

**When to Use Waterfall**:
- **Well-defined requirements** that are unlikely to change
- **Regulatory environments** requiring extensive documentation
- **Large, complex projects** with multiple dependencies
- **Fixed budget and timeline** constraints

## Risk Management

**Risk Management Process**:
1. **Risk Identification**: Brainstorm potential risks and issues
2. **Risk Analysis**: Assess probability and impact of risks
3. **Risk Response Planning**: Develop strategies to address risks
4. **Risk Monitoring**: Track identified risks and identify new ones

**Risk Response Strategies**:
- **Avoid**: Eliminate risk by changing project approach
- **Mitigate**: Reduce probability or impact of risk
- **Transfer**: Shift risk to third party (insurance, contracts)
- **Accept**: Acknowledge risk and develop contingency plans

**Common Project Risks**:
- **Scope Creep**: Uncontrolled expansion of project scope
- **Resource Constraints**: Insufficient people, budget, or time
- **Technical Challenges**: Complexity or new technology risks
- **Stakeholder Issues**: Conflicting requirements or lack of engagement
- **External Dependencies**: Reliance on third parties or external factors

## Stakeholder Management

**Stakeholder Identification**:
- **Primary Stakeholders**: Directly affected by project (users, sponsors, team)
- **Secondary Stakeholders**: Indirectly affected (vendors, regulators, community)
- **Key Stakeholders**: High influence and interest in project success

**Stakeholder Analysis**:
- **Power/Interest Grid**: Map stakeholders by influence level and project interest
- **Engagement Strategies**: Manage closely, keep satisfied, keep informed, monitor

**Communication Management**:
- **Communication Plan**: Define what, when, how, and to whom to communicate
- **Status Reports**: Regular updates on progress, issues, and risks
- **Stakeholder Meetings**: Scheduled touchpoints for feedback and alignment
- **Change Communication**: Inform stakeholders of scope or timeline changes

## Team Leadership and Management

**Team Development Stages**:
1. **Forming**: Team comes together, roles unclear
2. **Storming**: Conflicts emerge, roles challenged
3. **Norming**: Team establishes working relationships
4. **Performing**: Team works effectively toward goals
5. **Adjourning**: Project ends, team dissolves

**Leadership Styles**:
- **Directive**: Clear instructions and close supervision
- **Coaching**: Guide team members and provide support
- **Supporting**: Facilitate and support team decisions
- **Delegating**: Provide resources and step back

**Motivation Techniques**:
- **Recognition**: Acknowledge good work and achievements
- **Growth Opportunities**: Provide learning and development chances
- **Autonomy**: Give team members control over their work
- **Purpose**: Connect work to meaningful outcomes

## Project Planning and Scheduling

**Work Breakdown Structure (WBS)**:
Hierarchical decomposition of project work into manageable components.
- **Deliverable-Oriented**: Focus on what will be produced
- **100% Rule**: WBS includes 100% of work, no more, no less
- **Levels**: Major deliverables broken down into work packages

**Scheduling Techniques**:
- **Gantt Charts**: Visual timeline showing tasks, dependencies, and progress
- **Critical Path Method (CPM)**: Identify longest path through project network
- **Program Evaluation and Review Technique (PERT)**: Account for uncertainty in estimates
- **Resource Leveling**: Smooth resource usage over time

**Estimation Techniques**:
- **Expert Judgment**: Leverage experience of subject matter experts
- **Analogous Estimating**: Use similar past projects as reference
- **Parametric Estimating**: Use statistical relationships and historical data
- **Three-Point Estimating**: Consider optimistic, pessimistic, and most likely scenarios

## Quality Management

**Quality Planning**:
- **Quality Standards**: Define acceptance criteria and quality metrics
- **Quality Assurance**: Process-focused activities to prevent defects
- **Quality Control**: Product-focused activities to detect defects

**Quality Tools**:
- **Checklists**: Ensure all required activities completed
- **Reviews and Inspections**: Peer review of deliverables
- **Testing**: Verify functionality and performance requirements
- **Audits**: Independent assessment of processes and deliverables

## Project Success Factors

**Success Criteria**:
- **On Time**: Deliver within agreed timeline
- **On Budget**: Complete within approved budget
- **Quality**: Meet specified requirements and standards
- **Stakeholder Satisfaction**: Achieve stakeholder expectations
- **Business Value**: Deliver intended benefits and ROI

**Critical Success Factors**:
- **Clear Objectives**: Well-defined goals and success criteria
- **Executive Sponsorship**: Strong leadership support and commitment
- **Stakeholder Engagement**: Active participation and buy-in
- **Competent Team**: Right skills and experience for project
- **Effective Communication**: Regular, clear, and timely information sharing
- **Risk Management**: Proactive identification and mitigation of risks

Successful project management requires balancing competing constraints while delivering value to stakeholders through effective planning, execution, and team leadership.`,
          questions: [
            {
              id: 'q1',
              question: 'What are the main differences between Agile and Waterfall project management?',
              options: [
                'Agile is faster, Waterfall is slower',
                'Agile is iterative and adaptive, Waterfall is sequential and plan-driven',
                'Agile is for software, Waterfall is for construction',
                'There are no significant differences'
              ],
              correctAnswer: 1,
              explanation: 'Agile emphasizes iterative development, flexibility, and adapting to change, while Waterfall follows a sequential approach with detailed upfront planning and limited changes once started.'
            },
            {
              id: 'q2',
              question: 'What is the primary role of a Scrum Master?',
              options: [
                'Manage the project budget and timeline',
                'Write code and develop features',
                'Facilitate the Scrum process and remove impediments',
                'Define product requirements and priorities'
              ],
              correctAnswer: 2,
              explanation: 'The Scrum Master serves the team by facilitating Scrum events, removing obstacles that impede progress, and coaching the team on Scrum practices, rather than managing in a traditional sense.'
            }
          ],
          nextSteps: [
            'Learn about specific project management tools (Jira, Asana, Trello)',
            'Practice creating project plans and schedules',
            'Study for PMP or Agile certification',
            'Participate in or lead a small project'
          ],
          estimatedDuration: 26
        },
        '9': {
          content: `# Advanced React Development

## React Fundamentals Review

React is a JavaScript library for building user interfaces, particularly single-page applications where you need a fast, interactive user experience. React uses a component-based architecture and virtual DOM for efficient rendering.

**Core Concepts**:
- **Components**: Reusable pieces of UI that can be composed together
- **JSX**: JavaScript syntax extension that looks like HTML
- **Props**: Data passed from parent to child components
- **State**: Internal component data that can change over time
- **Virtual DOM**: React's representation of the actual DOM for efficient updates

## React Hooks

**useState Hook**:
Manages local component state in functional components.

**Example Usage**:
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: '', email: '' });

**Best Practices**:
- Initialize state with appropriate default values
- Use functional updates when new state depends on previous state
- Split state into multiple useState calls for unrelated data
- Don't mutate state directly, always use setter function

**useEffect Hook**:
Handles side effects in functional components (data fetching, subscriptions, DOM manipulation).

**Effect Patterns**:
- **Component Mount**: useEffect(() => {}, []) - empty dependency array
- **Component Update**: useEffect(() => {}) - no dependency array
- **Conditional Effects**: useEffect(() => {}, [dependency]) - specific dependencies
- **Cleanup**: Return cleanup function from useEffect

**useContext Hook**:
Consumes context values without wrapping components in Context.Consumer.

**Context Pattern**:
const ThemeContext = createContext();
const theme = useContext(ThemeContext);

**Custom Hooks**:
Extract component logic into reusable functions.

**Custom Hook Example**:
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);
  return { count, increment, decrement, reset };
}

## Advanced State Management

**useReducer Hook**:
Alternative to useState for complex state logic.

**Reducer Pattern**:
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      throw new Error();
  }
}

**When to Use useReducer**:
- Complex state objects with multiple sub-values
- State transitions depend on previous state
- State logic involves multiple actions
- Need to optimize performance with useCallback

**Context API for Global State**:
React's built-in solution for prop drilling and global state management.

**Context Setup**:
const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

**Context Best Practices**:
- Split contexts by concern (user, theme, app state)
- Use multiple contexts instead of one large context
- Memoize context values to prevent unnecessary re-renders
- Consider performance implications of context updates

## Performance Optimization

**React.memo**:
Higher-order component that memoizes component rendering.

**Usage**:
const MemoizedComponent = React.memo(function MyComponent({ name }) {
  return <div>{name}</div>;
});

**Custom Comparison**:
const MemoizedComponent = React.memo(MyComponent, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});

**useMemo Hook**:
Memoizes expensive calculations.

**Example**:
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

**useCallback Hook**:
Memoizes function references to prevent unnecessary re-renders.

**Example**:
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

**Code Splitting**:
Split your bundle into smaller chunks that are loaded on demand.

**Dynamic Imports**:
const LazyComponent = React.lazy(() => import('./LazyComponent'));

**Suspense**:
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>

## Advanced Component Patterns

**Higher-Order Components (HOCs)**:
Functions that take a component and return a new component with additional functionality.

**HOC Example**:
function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...props} />;
  };
}

**Render Props Pattern**:
Component that uses a function prop to determine what to render.

**Example**:
function DataFetcher({ render }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData().then(data => {
      setData(data);
      setLoading(false);
    });
  }, []);
  
  return render({ data, loading });
}

**Compound Components**:
Components that work together to form a complete UI.

**Example**:
<Tabs>
  <TabList>
    <Tab>Tab 1</Tab>
    <Tab>Tab 2</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Panel 1</TabPanel>
    <TabPanel>Panel 2</TabPanel>
  </TabPanels>
</Tabs>

## Error Handling

**Error Boundaries**:
React components that catch JavaScript errors in child component tree.

**Error Boundary Implementation**:
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

**Error Handling Best Practices**:
- Wrap components that might throw errors
- Provide meaningful error messages to users
- Log errors for debugging and monitoring
- Consider graceful degradation strategies

## Testing React Applications

**Testing Libraries**:
- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **Enzyme**: Alternative testing utility (less recommended now)

**Testing Strategies**:
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows

**Testing Best Practices**:
- Test behavior, not implementation details
- Use screen queries that resemble how users interact
- Mock external dependencies and API calls
- Test accessibility and keyboard navigation

**Example Test**:
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('increments counter when button is clicked', () => {
  render(<Counter />);
  const button = screen.getByText('Increment');
  const counter = screen.getByText('0');
  
  fireEvent.click(button);
  expect(screen.getByText('1')).toBeInTheDocument();
});

## React Router

**Client-Side Routing**:
Navigate between different views without full page reloads.

**Basic Setup**:
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

**Advanced Routing**:
- **Dynamic Routes**: /users/:id
- **Nested Routes**: Routes within routes
- **Protected Routes**: Authentication-based routing
- **Programmatic Navigation**: useNavigate hook

## State Management Libraries

**Redux Toolkit**:
Modern Redux with simplified API and best practices built-in.

**Redux Concepts**:
- **Store**: Single source of truth for application state
- **Actions**: Objects describing what happened
- **Reducers**: Functions that specify how state changes
- **Selectors**: Functions that extract specific pieces of state

**Zustand**:
Lightweight state management solution.

**Example**:
import create from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

## Modern React Patterns

**Concurrent Features**:
- **Suspense**: Handle loading states declaratively
- **Concurrent Rendering**: Interruptible rendering for better UX
- **useTransition**: Mark updates as non-urgent
- **useDeferredValue**: Defer expensive computations

**Server Components** (Experimental):
Components that render on the server, reducing bundle size and improving performance.

**React 18 Features**:
- **Automatic Batching**: Multiple state updates batched automatically
- **Strict Mode Improvements**: Better development experience
- **New Hooks**: useId, useSyncExternalStore, useInsertionEffect

## Development Tools and Workflow

**React Developer Tools**:
Browser extension for debugging React applications.

**Features**:
- Component tree inspection
- Props and state examination
- Performance profiling
- Hook debugging

**Development Best Practices**:
- Use TypeScript for type safety
- Implement ESLint and Prettier for code quality
- Use React Strict Mode during development
- Profile performance regularly
- Follow React naming conventions

**Build Tools**:
- **Create React App**: Zero-configuration setup
- **Vite**: Fast build tool with hot module replacement
- **Next.js**: Full-stack React framework
- **Webpack**: Module bundler with extensive configuration

Advanced React development requires understanding of performance optimization, modern patterns, and the broader React ecosystem to build scalable, maintainable applications.`,
          questions: [
            {
              id: 'q1',
              question: 'What is the main purpose of the useEffect hook in React?',
              options: [
                'To manage component state',
                'To handle side effects like data fetching and subscriptions',
                'To create reusable components',
                'To optimize component rendering'
              ],
              correctAnswer: 1,
              explanation: 'useEffect is used to handle side effects in functional components, such as data fetching, setting up subscriptions, timers, or manually changing the DOM.'
            },
            {
              id: 'q2',
              question: 'When should you use useReducer instead of useState?',
              options: [
                'When you have simple boolean state',
                'When you have complex state logic with multiple sub-values or state transitions',
                'When you want to optimize performance',
                'When working with forms'
              ],
              correctAnswer: 1,
              explanation: 'useReducer is preferred when you have complex state objects with multiple sub-values, when state transitions depend on previous state, or when you need to optimize performance with useCallback.'
            }
          ],
          nextSteps: [
            'Build a complex React application using hooks',
            'Implement state management with Context API or Redux',
            'Practice performance optimization techniques',
            'Learn React testing with React Testing Library'
          ],
          estimatedDuration: 35
        },
        '10': {
          content: `# UX/UI Design Principles

## What is UX/UI Design?

**User Experience (UX) Design** focuses on the overall experience users have when interacting with a product, emphasizing usability, accessibility, and user satisfaction. **User Interface (UI) Design** deals with the visual and interactive elements users encounter, including layout, colors, typography, and interactive components.

**Key Differences**:
- **UX Design**: Research, wireframing, prototyping, user testing, information architecture
- **UI Design**: Visual design, interaction design, design systems, responsive design

## Design Thinking Process

**5 Stages of Design Thinking**:

**1. Empathize**:
Understanding users' needs, thoughts, emotions, and motivations.
- **User Interviews**: One-on-one conversations to gather insights
- **Surveys**: Quantitative data collection from larger user groups
- **Observation**: Watching users interact with existing products
- **Empathy Maps**: Visual representations of user attitudes and behaviors

**2. Define**:
Synthesizing observations into a clear problem statement.
- **Problem Statement**: Clear, actionable problem definition
- **User Personas**: Fictional characters representing user segments
- **User Journey Maps**: Visual representation of user experience over time
- **Point of View Statements**: Human-centered design challenges

**3. Ideate**:
Generating creative solutions to the defined problem.
- **Brainstorming**: Free-flowing idea generation sessions
- **Mind Mapping**: Visual organization of ideas and concepts
- **Sketching**: Quick visual representations of ideas
- **Worst Possible Idea**: Reverse brainstorming to spark creativity

**4. Prototype**:
Building testable representations of ideas.
- **Paper Prototypes**: Quick, low-cost physical mockups
- **Digital Wireframes**: Basic structural blueprints
- **Interactive Prototypes**: Clickable, functional representations
- **High-Fidelity Mockups**: Detailed visual representations

**5. Test**:
Gathering feedback and iterating on solutions.
- **Usability Testing**: Observing users interact with prototypes
- **A/B Testing**: Comparing different design versions
- **Feedback Collection**: Gathering user opinions and suggestions
- **Iteration**: Refining designs based on test results

## User Research Methods

**Qualitative Research**:
- **User Interviews**: In-depth conversations about needs and behaviors
- **Focus Groups**: Group discussions about products or concepts
- **Ethnographic Studies**: Observing users in their natural environment
- **Diary Studies**: Users document their experiences over time

**Quantitative Research**:
- **Analytics**: Website/app usage data and metrics
- **Surveys**: Structured questionnaires for large user groups
- **A/B Testing**: Statistical comparison of design variations
- **Heat Maps**: Visual representation of user interaction patterns

**Research Planning**:
- **Research Questions**: What do you want to learn?
- **Target Audience**: Who are you researching?
- **Methodology**: How will you gather data?
- **Success Metrics**: How will you measure success?

## Information Architecture

**Organizing Information**:
Structuring and organizing content in a logical, findable way.

**Key Principles**:
- **Hierarchy**: Clear content organization from general to specific
- **Categorization**: Grouping related content together
- **Labeling**: Clear, consistent naming conventions
- **Navigation**: Intuitive pathways through content

**IA Techniques**:
- **Card Sorting**: Users organize content into logical groups
- **Tree Testing**: Testing navigation structure without visual design
- **Site Maps**: Visual representation of website structure
- **User Flows**: Paths users take to complete tasks

## Wireframing and Prototyping

**Wireframing**:
Basic structural blueprints showing layout and functionality without visual design.

**Types of Wireframes**:
- **Low-Fidelity**: Basic shapes and placeholder content
- **Mid-Fidelity**: More detail but still grayscale
- **High-Fidelity**: Detailed with actual content and interactions

**Prototyping Tools**:
- **Figma**: Collaborative design and prototyping platform
- **Sketch**: Vector-based design tool (Mac only)
- **Adobe XD**: Design and prototyping application
- **InVision**: Prototyping and collaboration platform
- **Axure**: Advanced prototyping for complex interactions

**Prototyping Best Practices**:
- Start with low-fidelity and iterate
- Focus on key user flows and interactions
- Test early and often with real users
- Document interactions and design decisions

## Visual Design Principles

**Layout and Composition**:
- **Grid Systems**: Structured layout foundation
- **Alignment**: Creating visual connections between elements
- **Proximity**: Grouping related elements together
- **White Space**: Using empty space effectively for clarity

**Typography**:
- **Hierarchy**: Different text sizes and weights for importance
- **Readability**: Easy-to-read fonts and appropriate sizing
- **Consistency**: Consistent font usage throughout design
- **Accessibility**: Sufficient contrast and scalable text

**Color Theory**:
- **Color Psychology**: How colors affect emotions and behavior
- **Color Harmony**: Complementary, analogous, and triadic schemes
- **Accessibility**: Ensuring sufficient contrast ratios
- **Brand Consistency**: Using colors that align with brand identity

**Visual Hierarchy**:
- **Size**: Larger elements draw more attention
- **Contrast**: High contrast elements stand out
- **Color**: Bright or contrasting colors attract attention
- **Position**: Elements higher and left get noticed first

## Interaction Design

**Micro-Interactions**:
Small, functional animations that enhance user experience.

**Examples**:
- Button hover effects
- Form validation feedback
- Loading animations
- Pull-to-refresh gestures

**Principles of Good Interactions**:
- **Feedback**: System responds to user actions
- **Feedforward**: Hints about what will happen
- **Consistency**: Similar actions have similar results
- **Error Prevention**: Design prevents mistakes

**Animation and Motion**:
- **Purposeful Motion**: Animation serves a functional purpose
- **Duration**: Appropriate timing (typically 200-500ms)
- **Easing**: Natural acceleration and deceleration
- **Accessibility**: Respect user preferences for reduced motion

## Accessibility (A11y)

**Web Content Accessibility Guidelines (WCAG)**:
International standards for web accessibility.

**Four Principles (POUR)**:
- **Perceivable**: Information presentable in ways users can perceive
- **Operable**: Interface components must be operable
- **Understandable**: Information and UI operation must be understandable
- **Robust**: Content must work with various assistive technologies

**Accessibility Implementation**:
- **Semantic HTML**: Use proper HTML elements for their intended purpose
- **Alt Text**: Descriptive text for images and media
- **Keyboard Navigation**: All functionality accessible via keyboard
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Indicators**: Clear visual indication of focused elements
- **Screen Reader Support**: ARIA labels and roles

**Inclusive Design**:
Designing for diverse abilities, ages, cultures, and contexts from the start.

## Responsive Design

**Mobile-First Approach**:
Design for mobile devices first, then enhance for larger screens.

**Breakpoints**:
Specific screen widths where design layout changes.
- **Small**: 320px - 768px (mobile)
- **Medium**: 768px - 1024px (tablet)
- **Large**: 1024px+ (desktop)

**Flexible Layouts**:
- **Fluid Grids**: Layouts that adapt to screen size
- **Flexible Images**: Images that scale with container
- **Media Queries**: CSS rules for different screen sizes
- **Touch-Friendly**: Appropriate tap target sizes (44px minimum)

## Design Systems

**What is a Design System?**:
Collection of reusable components, patterns, and guidelines that ensure consistency across products.

**Components of Design Systems**:
- **Design Tokens**: Basic design decisions (colors, spacing, typography)
- **Component Library**: Reusable UI components
- **Pattern Library**: Common interaction patterns
- **Style Guide**: Visual and voice guidelines
- **Documentation**: Usage guidelines and examples

**Benefits**:
- **Consistency**: Unified experience across products
- **Efficiency**: Faster design and development
- **Scalability**: Easy to maintain and update
- **Collaboration**: Common language between teams

## Usability Testing

**Testing Methods**:
- **Moderated Testing**: Researcher guides user through tasks
- **Unmoderated Testing**: Users complete tasks independently
- **Remote Testing**: Testing conducted over video calls
- **In-Person Testing**: Face-to-face testing sessions

**Testing Process**:
1. **Define Objectives**: What do you want to learn?
2. **Create Test Plan**: Tasks, scenarios, and success metrics
3. **Recruit Participants**: Representative users
4. **Conduct Sessions**: Observe and take notes
5. **Analyze Results**: Identify patterns and issues
6. **Report Findings**: Share insights with team
7. **Iterate Design**: Make improvements based on findings

**Key Metrics**:
- **Task Success Rate**: Percentage of completed tasks
- **Time on Task**: How long tasks take to complete
- **Error Rate**: Number of mistakes made
- **Satisfaction**: User ratings and feedback
- **System Usability Scale (SUS)**: Standardized usability questionnaire

## Current Design Trends

**Visual Trends**:
- **Minimalism**: Clean, simple interfaces with lots of white space
- **Dark Mode**: Alternative color schemes for low-light environments
- **Neumorphism**: Soft, extruded design elements
- **Glassmorphism**: Translucent, frosted glass effects
- **Bold Typography**: Large, expressive fonts as design elements

**Interaction Trends**:
- **Voice User Interfaces**: Design for voice interactions
- **Gesture-Based Navigation**: Swipe, pinch, and gesture controls
- **Augmented Reality**: Overlaying digital information on real world
- **Personalization**: Adaptive interfaces based on user behavior

Successful UX/UI design requires understanding users, following established principles, and continuously testing and iterating to create meaningful, accessible, and delightful experiences.`,
          questions: [
            {
              id: 'q1',
              question: 'What is the main difference between UX and UI design?',
              options: [
                'UX is for websites, UI is for mobile apps',
                'UX focuses on overall user experience, UI focuses on visual and interactive elements',
                'UX is more technical, UI is more creative',
                'There is no difference between UX and UI'
              ],
              correctAnswer: 1,
              explanation: 'UX design focuses on the overall experience users have with a product (research, usability, user satisfaction), while UI design deals with the visual and interactive elements users see and interact with (layout, colors, buttons).'
            },
            {
              id: 'q2',
              question: 'What does the POUR principle in accessibility stand for?',
              options: [
                'Pretty, Organized, Usable, Responsive',
                'Perceivable, Operable, Understandable, Robust',
                'Practical, Optimal, Universal, Reliable',
                'Purposeful, Obvious, Unified, Refined'
              ],
              correctAnswer: 1,
              explanation: 'POUR represents the four main principles of web accessibility: Perceivable (information can be perceived), Operable (interface can be operated), Understandable (information is understandable), and Robust (content works with assistive technologies).'
            }
          ],
          nextSteps: [
            'Practice user research and interviewing techniques',
            'Learn design tools like Figma or Sketch',
            'Study accessibility guidelines and test with screen readers',
            'Build a portfolio with case studies showing your design process'
          ],
          estimatedDuration: 28
        },
        '11': {
          content: `# Blockchain & Cryptocurrency

## What is Blockchain?

Blockchain is a distributed, immutable ledger technology that maintains a continuously growing list of records (blocks) that are linked and secured using cryptography. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.

**Key Characteristics**:
- **Decentralization**: No single point of control or failure
- **Immutability**: Once recorded, data cannot be easily altered
- **Transparency**: All transactions are visible to network participants
- **Security**: Cryptographic protection against fraud and tampering
- **Consensus**: Network agreement on the validity of transactions

## How Blockchain Works

**Block Structure**:
Each block contains:
- **Block Header**: Metadata about the block
- **Previous Block Hash**: Links to the previous block
- **Merkle Root**: Summary of all transactions in the block
- **Timestamp**: When the block was created
- **Nonce**: Number used once for proof-of-work
- **Transactions**: The actual transaction data

**Cryptographic Hashing**:
- **SHA-256**: Secure Hash Algorithm producing 256-bit hash
- **Hash Properties**: Deterministic, fixed output size, avalanche effect
- **Digital Fingerprint**: Unique identifier for each block
- **Chain Integrity**: Any change breaks the chain

**Consensus Mechanisms**:
Methods for network participants to agree on blockchain state.

**Proof of Work (PoW)**:
- **Mining**: Computational puzzle solving to validate blocks
- **Energy Intensive**: Requires significant computational power
- **Security**: Extremely difficult to attack due to computational cost
- **Examples**: Bitcoin, Ethereum (pre-2022)

**Proof of Stake (PoS)**:
- **Validators**: Chosen based on their stake in the network
- **Energy Efficient**: Much lower energy consumption than PoW
- **Penalties**: Validators lose stake for malicious behavior
- **Examples**: Ethereum 2.0, Cardano, Polkadot

## Cryptocurrency Fundamentals

**What is Cryptocurrency?**:
Digital or virtual currency secured by cryptography, making it nearly impossible to counterfeit. Most cryptocurrencies are decentralized networks based on blockchain technology.

**Bitcoin - The First Cryptocurrency**:
- **Created**: 2009 by pseudonymous Satoshi Nakamoto
- **Purpose**: Peer-to-peer electronic cash system
- **Supply**: Limited to 21 million coins
- **Mining**: New bitcoins created through proof-of-work
- **Store of Value**: Often called "digital gold"

**Key Cryptocurrency Concepts**:
- **Wallets**: Software or hardware for storing private keys
- **Public/Private Keys**: Cryptographic key pairs for transactions
- **Addresses**: Public identifiers for receiving cryptocurrency
- **Transactions**: Transfers of value between addresses
- **Confirmations**: Network validation of transactions

## Types of Cryptocurrencies

**Bitcoin (BTC)**:
- **First and largest cryptocurrency by market cap**
- **Digital store of value and medium of exchange**
- **Limited supply creates scarcity value**
- **Network effects and institutional adoption**

**Ethereum (ETH)**:
- **Smart contract platform and cryptocurrency**
- **Enables decentralized applications (dApps)**
- **Gas fees for transaction processing**
- **Transition from PoW to PoS consensus**

**Altcoins** (Alternative Cryptocurrencies):
- **Litecoin (LTC)**: Faster Bitcoin alternative
- **Ripple (XRP)**: Cross-border payment solutions
- **Cardano (ADA)**: Research-driven blockchain platform
- **Polkadot (DOT)**: Multi-chain interoperability

**Stablecoins**:
Cryptocurrencies designed to maintain stable value.
- **Fiat-Collateralized**: Backed by traditional currencies (USDC, USDT)
- **Crypto-Collateralized**: Backed by other cryptocurrencies (DAI)
- **Algorithmic**: Use smart contracts to maintain stability

## Smart Contracts and DApps

**Smart Contracts**:
Self-executing contracts with terms directly written into code.

**Characteristics**:
- **Automated Execution**: Run automatically when conditions are met
- **Immutable**: Cannot be changed once deployed (unless designed to be)
- **Transparent**: Code is visible on the blockchain
- **Trustless**: No need for intermediaries

**Use Cases**:
- **Decentralized Finance (DeFi)**: Lending, borrowing, trading
- **Non-Fungible Tokens (NFTs)**: Unique digital assets
- **Supply Chain**: Track products from origin to consumer
- **Insurance**: Automated claim processing
- **Voting**: Transparent, tamper-proof elections

**Decentralized Applications (dApps)**:
Applications that run on blockchain networks instead of centralized servers.

**dApp Architecture**:
- **Frontend**: User interface (web or mobile app)
- **Smart Contracts**: Backend logic on blockchain
- **Blockchain Network**: Decentralized infrastructure
- **IPFS/Storage**: Decentralized file storage

## Decentralized Finance (DeFi)

**What is DeFi?**:
Financial services built on blockchain technology that operate without traditional intermediaries like banks.

**Core DeFi Protocols**:

**Decentralized Exchanges (DEXs)**:
- **Uniswap**: Automated market maker for token swaps
- **SushiSwap**: Community-driven DEX with yield farming
- **Curve**: Optimized for stablecoin trading
- **Balancer**: Multi-token automated portfolio manager

**Lending and Borrowing**:
- **Compound**: Algorithmic money market protocol
- **Aave**: Flash loans and variable interest rates
- **MakerDAO**: Decentralized stablecoin (DAI) creation
- **Collateralization**: Over-collateralized lending

**Yield Farming and Liquidity Mining**:
- **Liquidity Provision**: Providing tokens to DEX pools
- **Yield Optimization**: Strategies to maximize returns
- **Impermanent Loss**: Risk of providing liquidity
- **Governance Tokens**: Rewards for protocol participation

**DeFi Risks**:
- **Smart Contract Risk**: Bugs or exploits in code
- **Liquidation Risk**: Collateral seized if prices fall
- **Regulatory Risk**: Uncertain legal status
- **Market Risk**: High volatility and correlation

## Non-Fungible Tokens (NFTs)

**What are NFTs?**:
Unique digital assets that represent ownership of specific items or content on the blockchain.

**Key Properties**:
- **Non-Fungible**: Each token is unique and not interchangeable
- **Indivisible**: Cannot be divided into smaller units
- **Ownership**: Provable ownership on blockchain
- **Transferable**: Can be bought, sold, and traded

**NFT Use Cases**:
- **Digital Art**: Unique artwork and collectibles
- **Gaming**: In-game items and characters
- **Music**: Albums, songs, and concert tickets
- **Real Estate**: Virtual land and property
- **Identity**: Digital identity and credentials
- **Utility**: Access tokens and memberships

**NFT Marketplaces**:
- **OpenSea**: Largest NFT marketplace
- **Rarible**: Community-owned marketplace
- **SuperRare**: Curated digital art platform
- **NBA Top Shot**: Basketball collectibles

## Blockchain Scalability

**Scalability Trilemma**:
Challenge of achieving decentralization, security, and scalability simultaneously.

**Layer 1 Solutions**:
Improvements to the main blockchain.
- **Sharding**: Splitting blockchain into smaller chains
- **Consensus Improvements**: More efficient consensus mechanisms
- **Block Size Increases**: More transactions per block

**Layer 2 Solutions**:
Secondary protocols built on top of main blockchain.
- **Lightning Network**: Bitcoin payment channels
- **Polygon**: Ethereum scaling with sidechains
- **Optimistic Rollups**: Bundle transactions off-chain
- **ZK-Rollups**: Zero-knowledge proof rollups

## Cryptocurrency Trading and Investment

**Trading Strategies**:
- **HODLing**: Long-term holding strategy
- **Day Trading**: Short-term price movements
- **Swing Trading**: Medium-term trend following
- **Dollar-Cost Averaging**: Regular purchases regardless of price

**Technical Analysis**:
- **Chart Patterns**: Support, resistance, trends
- **Indicators**: Moving averages, RSI, MACD
- **Volume Analysis**: Trading volume insights
- **Market Sentiment**: Fear and greed indicators

**Risk Management**:
- **Position Sizing**: Never risk more than you can afford to lose
- **Diversification**: Spread risk across different assets
- **Stop Losses**: Automatic selling to limit losses
- **Research**: Understand projects before investing

## Regulatory Landscape

**Global Regulatory Approaches**:
- **United States**: SEC oversight, state-level regulations
- **European Union**: MiCA regulation framework
- **China**: Ban on cryptocurrency trading and mining
- **Japan**: Progressive regulatory framework
- **El Salvador**: Bitcoin as legal tender

**Compliance Considerations**:
- **KYC/AML**: Know Your Customer and Anti-Money Laundering
- **Tax Reporting**: Capital gains and income tax obligations
- **Securities Laws**: Token classification and registration
- **Consumer Protection**: Investor safeguards and disclosures

## Future of Blockchain and Crypto

**Emerging Trends**:
- **Central Bank Digital Currencies (CBDCs)**: Government-issued digital currencies
- **Web3**: Decentralized internet built on blockchain
- **Metaverse**: Virtual worlds with blockchain-based economies
- **Green Blockchain**: Environmentally sustainable consensus mechanisms
- **Interoperability**: Cross-chain communication and asset transfers

**Institutional Adoption**:
- **Corporate Treasury**: Companies holding Bitcoin as reserves
- **Payment Integration**: Cryptocurrency payment processing
- **Traditional Finance**: Banks offering crypto services
- **Investment Products**: ETFs and institutional investment vehicles

Blockchain and cryptocurrency represent a paradigm shift toward decentralized, trustless systems that could reshape finance, technology, and many other industries.`,
          questions: [
            {
              id: 'q1',
              question: 'What is the main difference between Proof of Work (PoW) and Proof of Stake (PoS)?',
              options: [
                'PoW is faster than PoS',
                'PoW requires computational mining, PoS selects validators based on their stake',
                'PoW is more secure than PoS',
                'PoS is only used for Bitcoin'
              ],
              correctAnswer: 1,
              explanation: 'PoW requires miners to solve computational puzzles to validate blocks (energy-intensive), while PoS selects validators based on their stake in the network (energy-efficient). PoS validators are chosen to create blocks based on their holdings.'
            },
            {
              id: 'q2',
              question: 'What makes Non-Fungible Tokens (NFTs) different from regular cryptocurrencies?',
              options: [
                'NFTs are more expensive',
                'NFTs are unique and indivisible, while cryptocurrencies are fungible and divisible',
                'NFTs can only be used for art',
                'NFTs are not stored on blockchain'
              ],
              correctAnswer: 1,
              explanation: 'NFTs are non-fungible (unique and not interchangeable) and indivisible, representing ownership of specific digital items. Regular cryptocurrencies are fungible (interchangeable) and divisible into smaller units.'
            }
          ],
          nextSteps: [
            'Set up a cryptocurrency wallet and make small transactions',
            'Explore DeFi protocols on testnet networks',
            'Learn about smart contract development with Solidity',
            'Study blockchain projects and their whitepapers'
          ],
          estimatedDuration: 40
        },
        'default': {
          content: `# Learning Module Content

Welcome to this comprehensive learning module! This course has been designed to provide you with practical knowledge and skills.

## Course Overview

This module covers essential concepts and practical applications in the subject area. You'll learn through a combination of:

- **Theoretical Foundation**: Core concepts and principles
- **Practical Examples**: Real-world applications and case studies  
- **Hands-on Exercises**: Interactive learning activities
- **Assessment**: Knowledge checks and skill validation

## Learning Objectives

By the end of this module, you will be able to:

1. Understand the fundamental concepts and terminology
2. Apply theoretical knowledge to practical scenarios
3. Analyze problems and develop effective solutions
4. Demonstrate proficiency through hands-on practice

## Course Structure

**Module 1: Foundations**
- Introduction to key concepts
- Historical context and evolution
- Current industry standards

**Module 2: Core Principles**
- Essential theories and frameworks
- Best practices and methodologies
- Common challenges and solutions

**Module 3: Practical Application**
- Real-world case studies
- Hands-on projects and exercises
- Tools and technologies overview

**Module 4: Advanced Topics**
- Emerging trends and innovations
- Advanced techniques and strategies
- Future directions and opportunities

## Prerequisites

- Basic understanding of related concepts
- Familiarity with fundamental principles
- Access to required tools and resources

## Resources and Support

- Comprehensive reading materials
- Video tutorials and demonstrations
- Interactive exercises and simulations
- Community forums and peer support
- Expert guidance and feedback

Ready to begin your learning journey? Let's dive into the exciting world of knowledge and skill development!`,
          questions: [
            {
              id: 'q1',
              question: 'What are the main components of this learning module?',
              options: [
                'Theoretical foundation, practical examples, hands-on exercises, and assessment',
                'Only theoretical concepts',
                'Just practical exercises',
                'Only assessment questions'
              ],
              correctAnswer: 0,
              explanation: 'This comprehensive module combines theoretical foundation, practical examples, hands-on exercises, and assessment for complete learning.'
            },
            {
              id: 'q2',
              question: 'What is the primary goal of this course?',
              options: [
                'To memorize facts',
                'To understand concepts and apply them practically',
                'To pass an exam',
                'To complete assignments quickly'
              ],
              correctAnswer: 1,
              explanation: 'The primary goal is to understand fundamental concepts and apply theoretical knowledge to practical scenarios.'
            }
          ],
          nextSteps: [
            'Complete all module exercises',
            'Apply knowledge to real projects',
            'Explore advanced topics',
            'Join community discussions'
          ],
          estimatedDuration: 25
        }
      }

      const moduleContent = contentMap[moduleId] || contentMap['default']
      setLearningContent(moduleContent)
      setIsLoading(false)
    }, 1500)
  }, [moduleId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (!isPaused && currentStep !== 'complete') {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPaused, currentStep])

  const handleAnswer = (questionId: string, answer: number, timeSpent: number) => {
    setUserAnswers(prev => [...prev, { questionId, answer, timeSpent }])
  }

  const handleNextQuestion = () => {
    if (learningContent && currentQuestionIndex < learningContent.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Quiz completed - check if user passed (at least 1 correct out of 2)
      const correctAnswers = userAnswers.filter((userAnswer, index) => {
        const question = learningContent?.questions[index]
        return question && userAnswer.answer === question.correctAnswer
      }).length
      
      const passed = correctAnswers >= 1 // At least 1 correct out of 2
      
      if (passed) {
        // Mark module as completed in localStorage
        markModuleAsCompleted(moduleId)
        
        // Store quiz results for scoring calculation
        localStorage.setItem(`quiz_results_${moduleId}`, JSON.stringify({
          correctAnswers: correctAnswers,
          totalQuestions: learningContent?.questions.length || 2
        }))
      }
      
      setCurrentStep('complete')
    }
  }
  
  const markModuleAsCompleted = (moduleId: string) => {
    try {
      const completedModules = JSON.parse(localStorage.getItem('completedModules') || '[]')
      if (!completedModules.includes(moduleId)) {
        completedModules.push(moduleId)
        localStorage.setItem('completedModules', JSON.stringify(completedModules))
        
        // Also store completion date
        const completionDates = JSON.parse(localStorage.getItem('moduleCompletionDates') || '{}')
        completionDates[moduleId] = new Date().toISOString()
        localStorage.setItem('moduleCompletionDates', JSON.stringify(completionDates))
      }
    } catch (error) {
      console.error('Error saving module completion:', error)
    }
  }

  const handleStartQuestions = () => {
    setCurrentStep('questions')
  }

  const handleRestart = () => {
    setCurrentStep('content')
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setSessionTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateScore = () => {
    if (!learningContent) return 0
    const correctAnswers = userAnswers.filter(answer => {
      const question = learningContent.questions.find(q => q.id === answer.questionId)
      return question && answer.answer === question.correctAnswer
    }).length
    return Math.round((correctAnswers / learningContent.questions.length) * 100)
  }
  
  const getCorrectAnswersCount = () => {
    if (!learningContent) return 0
    return userAnswers.filter(answer => {
      const question = learningContent.questions.find(q => q.id === answer.questionId)
      return question && answer.answer === question.correctAnswer
    }).length
  }
  
  const hasPassedQuiz = () => {
    return getCorrectAnswersCount() >= 1 // At least 1 correct out of 2
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized content...</p>
        </div>
      </div>
    )
  }

  if (!learningContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Content not found</p>
          <button 
            onClick={() => router.back()}
            className="btn btn-primary mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Learning Module</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(sessionTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{learningContent.estimatedDuration} min estimated</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentStep === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
            >
              <div className="max-w-none">
                <div dangerouslySetInnerHTML={{ __html: formatContent(learningContent.content) }} />
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Ready to test your understanding?
                  </div>
                  <button
                    onClick={handleStartQuestions}
                    className="btn btn-primary px-6 py-2 rounded-lg font-medium"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'questions' && learningContent && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6">
                <ProgressBar
                  progress={currentQuestionIndex + 1}
                  total={learningContent.questions.length}
                  showPercentage={false}
                  showCount={true}
                />
              </div>
              
              <QuestionCard
                question={learningContent.questions[currentQuestionIndex]}
                onAnswer={handleAnswer}
                onNext={handleNextQuestion}
                isLastQuestion={currentQuestionIndex === learningContent.questions.length - 1}
              />
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8"
            >
              <div className={`w-16 h-16 ${hasPassedQuiz() ? 'bg-green-100' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <CheckCircle className={`w-8 h-8 ${hasPassedQuiz() ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {hasPassedQuiz() ? 'Congratulations!' : 'Good Effort!'}
              </h2>
              
              <p className="text-gray-600 mb-2">
                {hasPassedQuiz() 
                  ? "You've completed the learning module successfully!" 
                  : "You've finished the quiz, but didn't meet the passing criteria."}
              </p>
              
              {hasPassedQuiz() && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <p className="text-green-800 text-sm font-medium">
                    ✅ Module Completed! You got {getCorrectAnswersCount()} out of {learningContent?.questions.length || 2} questions correct.
                  </p>
                </div>
              )}
              
              {!hasPassedQuiz() && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
                  <p className="text-orange-800 text-sm">
                    You got {getCorrectAnswersCount()} out of {learningContent?.questions.length || 2} questions correct. 
                    You need at least 1 correct answer to complete the module. Try again!
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {calculateScore()}%
                  </div>
                  <div className="text-sm text-blue-800">Quiz Score</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {formatTime(sessionTime)}
                  </div>
                  <div className="text-sm text-purple-800">Time Spent</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {userAnswers.length}
                  </div>
                  <div className="text-sm text-green-800">Questions Answered</div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
                <div className="space-y-2">
                  {learningContent.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                {!hasPassedQuiz() && (
                  <button
                    onClick={() => {
                      setCurrentStep('questions')
                      setCurrentQuestionIndex(0)
                      setUserAnswers([])
                    }}
                    className="btn btn-primary px-6 py-2 rounded-lg font-medium"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </button>
                )}
                <button
                  onClick={handleRestart}
                  className="btn border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Review Content
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className={`btn px-6 py-2 rounded-lg font-medium ${
                    hasPassedQuiz() 
                      ? 'btn-primary' 
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {hasPassedQuiz() ? 'Continue Learning' : 'Back to Dashboard'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
