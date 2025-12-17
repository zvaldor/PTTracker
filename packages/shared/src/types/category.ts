export interface Category {
  id: string;
  userId: string;
  name: string;
  color?: string | null;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDto {
  name: string;
  color?: string;
  isEnabled?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
  isEnabled?: boolean;
}
