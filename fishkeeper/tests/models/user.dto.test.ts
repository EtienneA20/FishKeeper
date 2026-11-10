import { describe, expect, it } from 'vitest';
import { validate } from 'class-validator';
import { EROLE } from '@/constants/enum/role.enum';
import { IUserDto } from '@/interface/dto/user.dto';

function makeUserDto(role: string = EROLE.USER): IUserDto {
    return Object.assign(new IUserDto(), {
        name: 'Test User',
        email: 'user@example.test',
        role,
        departement: 'Aquariophilie',
    });
}

describe('IUserDto model', () => {
    it.each(Object.values(EROLE))('accepts role %s', async (role) => {
        expect(await validate(makeUserDto(role))).toHaveLength(0);
    });

    it('rejects a role outside the role enum', async () => {
        const errors = await validate(makeUserDto('OWNER'));
        expect(errors.map((error) => error.property)).toContain('role');
    });

    it('requires a valid email and a name of at least two characters', async () => {
        const dto = Object.assign(makeUserDto(), {
            name: 'A',
            email: 'not-an-email',
        });
        const errors = await validate(dto);
        expect(errors.map((error) => error.property)).toEqual(
            expect.arrayContaining(['name', 'email'])
        );
    });
});
