import { hobbiesMatch } from './featuredCourses';

describe('hobbiesMatch', () => {
  it('matches identical hobby names regardless of case and whitespace', () => {
    expect(hobbiesMatch('Guitar', 'guitar')).toBe(true);
    expect(hobbiesMatch('  Guitar  ', 'guitar')).toBe(true);
  });

  it('does not match different hobbies, even related ones', () => {
    expect(hobbiesMatch('Learn acoustic guitar', 'Guitar')).toBe(false);
    expect(hobbiesMatch('Painting', 'Watercolor painting')).toBe(false);
  });
});
