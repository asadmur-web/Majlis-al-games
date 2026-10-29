export interface QuestionPair {
  citizenQuestion: string;
  traitorQuestion: string;
  category: string;
}

export const localQuestionBank: QuestionPair[] = [
  {
    citizenQuestion: 'ما هو أجمل موسم في السنة من وجهة نظرك ولماذا؟',
    traitorQuestion: 'ما هو أسوأ موسم في السنة برأيك؟',
    category: 'أسلوب حياة'
  },
  {
    citizenQuestion: 'ما هي لعبتك المفضلة على الإطلاق وما الذي يجعلها مميزة؟',
    traitorQuestion: 'ما هي اللعبة التي تكرهها أكثر؟',
    category: 'ألعاب'
  },
  {
    citizenQuestion: 'اذكر ثلاثة أشياء تحب فعلها في وقت فراغك',
    traitorQuestion: 'اذكر ثلاثة أمور تثير ضيقك في الألعاب الجماعية',
    category: 'تسلية'
  },
];

export class QuestionGenerator {
  private usedQuestions = new Set<number>();
  
  async generateQuestions(count: number = 3): Promise<QuestionPair[]> {
    // In production, this would call Gemini API
    // For now, use local bank with random selection
    
    const available = localQuestionBank.filter((_, i) => !this.usedQuestions.has(i));
    const selected: QuestionPair[] = [];
    
    for (let i = 0; i < count && available.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      const question = available[randomIndex];
      const originalIndex = localQuestionBank.indexOf(question);
      
      selected.push(question);
      this.usedQuestions.add(originalIndex);
      available.splice(randomIndex, 1);
    }
    
    // Reset if we ran out of questions
    if (selected.length < count) {
      this.usedQuestions.clear();
      return this.generateQuestions(count);
    }
    
    return selected;
  }
  
  async generateWithGemini(count: number = 3): Promise<QuestionPair[]> {
    // Gemini API integration would go here
    // const prompt = `Generate ${count} question pairs for a party game...`;
    // const response = await fetch(GEMINI_API_URL, {...});
    
    // Fallback to local bank for now
    return this.generateQuestions(count);
  }
  
  reset(): void {
    this.usedQuestions.clear();
  }
}

export const questionGenerator = new QuestionGenerator();
