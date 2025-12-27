import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { useTheme } from '../../context/ThemeContext';

// Typography components

interface PageContainerProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  breadcrumb?: { title: string; path?: string }[];
  extra?: React.ReactNode;
  children: React.ReactNode;
}

const Container = styled.div<{ isDark: boolean }>`
  padding: 0;
  min-height: calc(100vh - 72px - 48px);
  background: transparent;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const HeaderWrapper = styled.div<{ isDark: boolean }>`
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.04)'};
`;

const BreadcrumbWrapper = styled.div`
  margin-bottom: 16px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconBox = styled.div<{ isDark: boolean }>`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.04)'};
  border: 1px solid ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  display: flex;
  align-items: center;
  justify-content: center;

  .anticon {
    font-size: 24px;
    color: ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.65)'
      : 'rgba(0, 0, 0, 0.65)'};
  }
`;

const TitleContent = styled.div<{ isDark: boolean }>`
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: ${props => props.isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.88)'};
    line-height: 1.4;
  }

  p {
    margin: 4px 0 0;
    font-size: 14px;
    color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  > * {
    width: 100% !important;
    max-width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    box-sizing: border-box !important;
  }
`;

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  icon,
  breadcrumb,
  extra,
  children,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <Container isDark={isDarkMode}>
      <HeaderWrapper isDark={isDarkMode}>
        {breadcrumb && breadcrumb.length > 0 && (
          <BreadcrumbWrapper>
            <Breadcrumb
              items={[
                { title: <HomeOutlined />, href: '/' },
                ...breadcrumb.map(item => ({
                  title: item.title,
                  href: item.path,
                })),
              ]}
              style={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
              }}
            />
          </BreadcrumbWrapper>
        )}
        <TitleRow>
          <TitleGroup>
            {icon && (
              <IconBox isDark={isDarkMode}>
                {icon}
              </IconBox>
            )}
            <TitleContent isDark={isDarkMode}>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </TitleContent>
          </TitleGroup>
          {extra && <div>{extra}</div>}
        </TitleRow>
      </HeaderWrapper>
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </Container>
  );
};

export default PageContainer;
