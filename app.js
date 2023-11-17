const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

class Question {
    constructor(question, subject, topic, difficulty, marks) {
        this.question = question;
        this.subject = subject;
        this.topic = topic;
        this.difficulty = difficulty;
        this.marks = marks;
    }
}

class QuestionStore {
    constructor() {
        this.questions = [];
    }

    addQuestion(question) {
        this.questions.push(question);
    }

    getQuestionsByDifficulty(difficulty) {
        return this.questions.filter(q => q.difficulty === difficulty);
    }

    getQuestionsByTopic(topic) {
        return this.questions.filter(q => q.topic === topic);
    }
}

class QuestionPaperGenerator {
    constructor(questionStore) {
        this.questionStore = questionStore;
    }

    generateQuestionPaper(totalMarks, distribution) {
        const questionPaper = [];
        for (const [level, percentage] of Object.entries(distribution)) {
            const levelMarks = Math.floor(totalMarks * (percentage / 100));
            const questions = this.questionStore.getQuestionsByDifficulty(level);
            
            if (questions.length < levelMarks) {
                console.error(`Not enough questions available for ${level} difficulty.`);
                return [];
            }

            // Shuffle questions to randomize selection
            questions.sort(() => Math.random() - 0.5);
            
            // Select questions based on the calculated levelMarks
            const selectedQuestions = questions.slice(0, levelMarks);

            questionPaper.push(...selectedQuestions);
        }

        return questionPaper;
    }
}

const questionStore = new QuestionStore();
const questionPaperGenerator = new QuestionPaperGenerator(questionStore);

// API to add a question
app.post('/add-question', (req, res) => {
    const { question, subject, topic, difficulty, marks } = req.body;
    const newQuestion = new Question(question, subject, topic, difficulty, marks);
    questionStore.addQuestion(newQuestion);
    res.json({ message: 'Question added successfully!' });
});

// API to generate a question paper
app.post('/generate-paper', (req, res) => {
    const { totalMarks, distribution } = req.body;
    const generatedPaper = questionPaperGenerator.generateQuestionPaper(totalMarks, distribution);
    res.json(generatedPaper);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
