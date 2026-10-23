import { describe, it, expect } from "vitest";
import { userProfile } from "../data/profile";
import { projectsData } from "../data/projects";
import { isSafeUrl } from "../lib/security";

describe("Kiểm thử Tính toàn vẹn Dữ liệu Cá nhân & Dự án (Data Integrity Suite)", () => {
    describe("Dữ liệu Hồ sơ Cá nhân (userProfile)", () => {
        it("Thông tin định danh của Trần Văn Tuyên không được rỗng", () => {
            expect(userProfile.name).toBe("Trần Văn Tuyên");
            expect(userProfile.birthYear).toBe(2005);
            expect(userProfile.title.trim().length).toBeGreaterThan(0);
            expect(userProfile.subTitle.trim().length).toBeGreaterThan(0);
            expect(userProfile.statement.trim().length).toBeGreaterThan(20);
            expect(userProfile.bio.trim().length).toBeGreaterThan(50);
            expect(userProfile.location.trim().length).toBeGreaterThan(0);
            expect(userProfile.status.trim().length).toBeGreaterThan(0);
        });

        it("Thông tin học vấn tại Đại học Thủy Lợi (TLU) phải chuẩn xác", () => {
            expect(userProfile.university).toContain("Đại học Thủy lợi");
            expect(userProfile.faculty).toContain("Công nghệ Thông tin");
            expect(userProfile.major).toContain("Công nghệ Thông tin");
        });

        it("Danh sách vai trò chuyên môn (roles) phải có ít nhất 3 vai trò", () => {
            expect(Array.isArray(userProfile.roles)).toBe(true);
            expect(userProfile.roles.length).toBeGreaterThanOrEqual(3);
            userProfile.roles.forEach((role) => {
                expect(typeof role).toBe("string");
                expect(role.trim().length).toBeGreaterThan(0);
            });
        });

        it("Kỹ năng chuyên môn (skills) phải có đầy đủ các mảng công nghệ cốt lõi", () => {
            expect(userProfile.skills.length).toBeGreaterThanOrEqual(4);
            userProfile.skills.forEach((group) => {
                expect(group.category.trim().length).toBeGreaterThan(0);
                expect(group.items.length).toBeGreaterThan(0);
                group.items.forEach((item) => {
                    expect(item.trim().length).toBeGreaterThan(0);
                });
            });
        });

        it("Cấu hình phần cứng (hardware) phải đầy đủ thông số kỹ thuật", () => {
            const hw = userProfile.hardware;
            expect(hw.model).toContain("Lenovo IdeaPad");
            expect(hw.cpu).toContain("Intel");
            expect(hw.gpu).toContain("GeForce");
            expect(hw.ram).toContain("16GB");
            expect(hw.storage).toContain("SSD");
            expect(hw.display).toContain("120Hz");
        });

        it("Liên kết mạng xã hội (socials) phải có GitHub hợp lệ và Email đúng định dạng", () => {
            expect(userProfile.socials.length).toBeGreaterThanOrEqual(2);

            const githubSocial = userProfile.socials.find((s) => s.label.toLowerCase() === "github");
            expect(githubSocial).toBeDefined();
            expect(githubSocial?.href).toBe("https://github.com/TuyenTran205");
            expect(isSafeUrl(githubSocial?.href)).toBe(true);

            const emailSocial = userProfile.socials.find((s) => s.label.toLowerCase() === "email");
            expect(emailSocial).toBeDefined();
            expect(emailSocial?.href).toBe("mailto:tranvantuyen.dev@gmail.com");
            expect(isSafeUrl(emailSocial?.href)).toBe(true);

            // Regex kiểm tra email trong mailto
            const emailRegex = /^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            expect(emailSocial?.href).toMatch(emailRegex);
        });
    });

    describe("Dữ liệu Danh sách Dự án (projectsData)", () => {
        it("Phải có tối thiểu 4 dự án showcase tiêu biểu", () => {
            expect(Array.isArray(projectsData)).toBe(true);
            expect(projectsData.length).toBeGreaterThanOrEqual(4);
        });

        it("Mỗi dự án phải có đầy đủ mã code, tiêu đề, danh mục, mô tả chi tiết và trạng thái hợp lệ", () => {
            const validStatuses = ["Completed", "In Development", "Experimental"];

            projectsData.forEach((project) => {
                expect(project.id).toBeTruthy();
                expect(project.code).toMatch(/^[A-Z]{3}-\d{2}$/);
                expect(project.title.trim().length).toBeGreaterThan(3);
                expect(project.category.trim().length).toBeGreaterThan(3);
                expect(project.description.trim().length).toBeGreaterThan(20);
                expect(project.longDescription.trim().length).toBeGreaterThan(30);
                expect(validStatuses).toContain(project.status);
                expect(project.year.trim().length).toBeGreaterThanOrEqual(4);
            });
        });

        it("Tất cả dự án phải có danh sách tags, technologies và highlights phong phú", () => {
            projectsData.forEach((project) => {
                expect(project.tags.length).toBeGreaterThan(0);
                expect(project.technologies.length).toBeGreaterThan(0);
                expect(project.highlights.length).toBeGreaterThan(0);

                project.technologies.forEach((tech) => {
                    expect(tech.trim().length).toBeGreaterThan(0);
                });

                project.highlights.forEach((highlight) => {
                    expect(highlight.trim().length).toBeGreaterThan(0);
                });
            });
        });

        it("Tất cả link dự án và link GitHub phải an toàn và hợp lệ", () => {
            projectsData.forEach((project) => {
                expect(isSafeUrl(project.link)).toBe(true);

                if (project.github) {
                    expect(isSafeUrl(project.github)).toBe(true);
                    expect(project.github).toMatch(/^https:\/\/github\.com\//);
                }
            });
        });
    });
});
