
/**
 * Naive Bayes search implementation for financial data
 * This helps categorize and find relevant financial items based on text content
 */

// Define types for classification
interface TrainingItem {
  text: string;
  category: string;
}

interface CategoryProbabilities {
  [category: string]: number;
}

export class NaiveBayesSearcher {
  private vocabulary: Set<string> = new Set();
  private categoryWordCounts: Record<string, Record<string, number>> = {};
  private categoryCounts: Record<string, number> = {};
  private totalDocuments: number = 0;
  
  /**
   * Train the classifier with examples
   * @param trainingData - Array of text items with their categories
   */
  train(trainingData: TrainingItem[]): void {
    this.totalDocuments = trainingData.length;
    
    // Process each training item
    trainingData.forEach(item => {
      const { text, category } = item;
      
      // Initialize category data if needed
      if (!this.categoryWordCounts[category]) {
        this.categoryWordCounts[category] = {};
      }
      if (!this.categoryCounts[category]) {
        this.categoryCounts[category] = 0;
      }
      
      // Increment category count
      this.categoryCounts[category]++;
      
      // Process words in the text
      const words = this.tokenize(text);
      words.forEach(word => {
        this.vocabulary.add(word);
        
        if (!this.categoryWordCounts[category][word]) {
          this.categoryWordCounts[category][word] = 0;
        }
        this.categoryWordCounts[category][word]++;
      });
    });
  }
  
  /**
   * Classify new text into a category
   * @param text - The text to classify
   * @returns Most likely category
   */
  classify(text: string): string {
    const words = this.tokenize(text);
    const probabilities: CategoryProbabilities = {};
    
    // Calculate probability for each category
    Object.keys(this.categoryCounts).forEach(category => {
      // Start with prior probability of category
      probabilities[category] = Math.log(this.categoryCounts[category] / this.totalDocuments);
      
      // Calculate conditional probabilities for each word
      words.forEach(word => {
        // Using Laplace smoothing to handle unseen words
        const wordCount = this.categoryWordCounts[category][word] || 0;
        const totalWordsInCategory = Object.values(this.categoryWordCounts[category]).reduce((sum, count) => sum + count, 0);
        const probability = (wordCount + 1) / (totalWordsInCategory + this.vocabulary.size);
        
        // Add log probability to avoid numerical underflow
        probabilities[category] += Math.log(probability);
      });
    });
    
    // Find category with highest probability
    let bestCategory = '';
    let highestProbability = -Infinity;
    
    Object.entries(probabilities).forEach(([category, probability]) => {
      if (probability > highestProbability) {
        highestProbability = probability;
        bestCategory = category;
      }
    });
    
    return bestCategory;
  }
  
  /**
   * Search for items related to a query using Naive Bayes scoring
   * @param items - Array of items to search through
   * @param query - Search query
   * @param textField - Field containing the text to search in
   * @returns Sorted array of items by relevance
   */
  search<T extends { [key: string]: any }>(
    items: T[],
    query: string,
    textField: keyof T
  ): T[] {
    const queryWords = this.tokenize(query);
    
    if (queryWords.length === 0) return items;
    
    // Score each item based on word relevance
    const scoredItems = items.map(item => {
      const text = String(item[textField]);
      const itemWords = this.tokenize(text);
      let score = 0;
      
      // Calculate simple relevance score
      queryWords.forEach(queryWord => {
        if (itemWords.includes(queryWord)) {
          score += 1;
        }
        // Partial matching
        itemWords.forEach(itemWord => {
          if (itemWord.includes(queryWord) || queryWord.includes(itemWord)) {
            score += 0.5;
          }
        });
      });
      
      return { item, score };
    });
    
    // Sort by score (descending) and return items
    return scoredItems
      .sort((a, b) => b.score - a.score)
      .map(scoredItem => scoredItem.item);
  }
  
  /**
   * Simple tokenization of text into words
   * @param text - Text to tokenize
   * @returns Array of lowercase words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }
}

// Create and export a singleton instance
export const financialSearcher = new NaiveBayesSearcher();
