import { createListingSchema } from '../src/validators/listing.validator';

describe('Listing Validator (Joi Schema)', () => {
  describe('Valid payloads', () => {
    it('should accept a complete valid payload', () => {
      const { error } = createListingSchema.validate({
        title: 'Rare Charizard Card',
        description: 'A very rare pokemon card in pristine condition. Selling for good price.',
        price: 1500,
        condition: 'MINT',
        images: ['https://img.com/1.jpg', 'https://img.com/2.jpg', 'https://img.com/3.jpg']
      });
      expect(error).toBeUndefined();
    });

    it('should accept all valid condition values', () => {
      const conditions = ['MINT', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
      conditions.forEach(condition => {
        const { error } = createListingSchema.validate({
          title: 'Test Title Here',
          description: 'A long enough description for the validator to be happy with this',
          price: 100,
          condition,
          images: ['https://a.com/1.jpg', 'https://a.com/2.jpg', 'https://a.com/3.jpg']
        });
        expect(error).toBeUndefined();
      });
    });
  });

  describe('Invalid payloads', () => {
    it('should reject missing title', () => {
      const { error } = createListingSchema.validate({
        description: 'A long enough description here to pass',
        price: 100,
        condition: 'MINT',
        images: ['https://a.com/1.jpg', 'https://a.com/2.jpg', 'https://a.com/3.jpg']
      });
      expect(error).toBeDefined();
      expect(error!.details[0].path).toContain('title');
    });

    it('should reject title shorter than 5 characters', () => {
      const { error } = createListingSchema.validate({
        title: 'Hi',
        description: 'A long enough description here to pass',
        price: 100,
        condition: 'MINT',
        images: ['https://a.com/1.jpg', 'https://a.com/2.jpg', 'https://a.com/3.jpg']
      });
      expect(error).toBeDefined();
    });

    it('should reject title longer than 100 characters', () => {
      const { error } = createListingSchema.validate({
        title: 'A'.repeat(101),
        description: 'A long enough description here to pass',
        price: 100,
        condition: 'MINT',
        images: ['https://a.com/1.jpg', 'https://a.com/2.jpg', 'https://a.com/3.jpg']
      });
      expect(error).toBeDefined();
    });

    it('should reject missing description', () => {
      const { error } = createListingSchema.validate({
        title: 'Valid Title',
        price: 100,
        condition: 'MINT',
        images: ['https://a.com/1.jpg', 'https://a.com/2.jpg', 'https://a.com/3.jpg']
      });
      expect(error).toBeDefined();
    });

    it('should reject description shorter than 20 characters', () => {
      const { error } = createListingSchema.validate({
        title: 'Valid Title',
        description: 'Too short',
        price: 100,
        condition: 'MINT',
        images: ['https://a.com/1.jpg', 'https://a.com/2.jpg', 'https://a.com/3.jpg']
      });
      expect(error).toBeDefined();
    });

    it('should reject negative price', () => {
      const { error } = createListingSchema.validate({
        title: 'Valid Title',
        description: 'A long enough description here to pass',
        price: -10,
        condition: 'MINT',
        images: ['https://a.com/1.jpg', 'https://a.com/2.jpg', 'https://a.com/3.jpg']
      });
      expect(error).toBeDefined();
    });

    it('should reject zero price', () => {
      const { error } = createListingSchema.validate({
        title: 'Valid Title',
        description: 'A long enough description here to pass',
        price: 0,
        condition: 'MINT',
        images: ['https://a.com/1.jpg', 'https://a.com/2.jpg', 'https://a.com/3.jpg']
      });
      expect(error).toBeDefined();
    });

    it('should reject invalid condition value', () => {
      const { error } = createListingSchema.validate({
        title: 'Valid Title',
        description: 'A long enough description here to pass',
        price: 100,
        condition: 'BROKEN',
        images: ['https://a.com/1.jpg', 'https://a.com/2.jpg', 'https://a.com/3.jpg']
      });
      expect(error).toBeDefined();
    });

    it('should reject fewer than 3 images', () => {
      const { error } = createListingSchema.validate({
        title: 'Valid Title',
        description: 'A long enough description here to pass',
        price: 100,
        condition: 'MINT',
        images: ['https://a.com/1.jpg']
      });
      expect(error).toBeDefined();
    });

    it('should reject non-URI image strings', () => {
      const { error } = createListingSchema.validate({
        title: 'Valid Title',
        description: 'A long enough description here to pass',
        price: 100,
        condition: 'MINT',
        images: ['not-a-url', 'also-not', 'bad-format']
      });
      expect(error).toBeDefined();
    });

    it('should reject missing images', () => {
      const { error } = createListingSchema.validate({
        title: 'Valid Title',
        description: 'A long enough description here to pass',
        price: 100,
        condition: 'MINT'
      });
      expect(error).toBeDefined();
    });

    it('should reject missing price', () => {
      const { error } = createListingSchema.validate({
        title: 'Valid Title',
        description: 'A long enough description here to pass',
        condition: 'MINT',
        images: ['https://a.com/1.jpg', 'https://a.com/2.jpg', 'https://a.com/3.jpg']
      });
      expect(error).toBeDefined();
    });
  });
});
